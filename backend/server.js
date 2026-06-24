const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Config
const ROOM_MIN = parseInt(process.env.ROOM_MIN || "2", 10);
const ROOM_MAX = parseInt(process.env.ROOM_MAX || "5", 10);
const HISTORY_LIMIT = parseInt(process.env.HISTORY_LIMIT || "500", 10);
const SQLITE_PATH = process.env.SQLITE_PATH || path.join(__dirname, "chat.sqlite");

// SQLite setup with error handling
let db;
try {
  db = new sqlite3.Database(SQLITE_PATH, (err) => {
    if (err) {
      console.error(" Failed to open SQLite database:", err.message);
      process.exit(1);
    }
    console.log(" Connected to SQLite:", SQLITE_PATH);
  });

  db.on('error', (err) => {
    console.error(" SQLite runtime error:", err.message);
  });

  // Optimize SQLite for concurrent writes
  db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA synchronous = NORMAL;");
    db.run("PRAGMA busy_timeout = 5000;");
    
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room TEXT NOT NULL,
        username TEXT,
        text TEXT,
        is_system INTEGER NOT NULL DEFAULT 0,
        type TEXT,
        created_at INTEGER NOT NULL
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room, created_at)`);
  });
} catch (err) {
  console.error(" Fatal error initializing database:", err);
  process.exit(1);
}

// In-memory presence tracking
const users = new Map();       // socketId -> { username, room }
const roomMembers = new Map(); // room -> Set(socketId)

function getParticipants(room) {
  const set = roomMembers.get(room) || new Set();
  return [...set].map(id => users.get(id)?.username).filter(Boolean);
}

// DB helpers
function insertSystem(room, type, username) {
  return new Promise((resolve, reject) => {
    const stmt = `
      INSERT INTO messages (room, username, text, is_system, type, created_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `;
    const text = type === "join" ? `${username} has entered the room` : `${username} has left the room`;
    db.run(stmt, [room, username, text, type, Date.now()], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, text });
    });
  });
}

function insertMessage(room, username, text) {
  return new Promise((resolve, reject) => {
    const stmt = `
      INSERT INTO messages (room, username, text, is_system, type, created_at)
      VALUES (?, ?, ?, 0, NULL, ?)
    `;
    db.run(stmt, [room, username, text, Date.now()], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

function getHistory(room, limit = HISTORY_LIMIT) {
  return new Promise((resolve, reject) => {
    const stmt = `
      SELECT room, username, text, is_system, type, created_at
      FROM messages
      WHERE room = ?
      ORDER BY created_at ASC
      LIMIT ?
    `;
    db.all(stmt, [room, limit], (err, rows) => {
      if (err) return reject(err);
      const mapped = rows.map(r => {
        if (r.is_system) {
          return { isSystem: true, type: r.type, username: r.username, text: r.text, time: r.created_at };
        }
        return { isSystem: false, from: r.username, text: r.text, time: r.created_at };
      });
      resolve(mapped);
    });
  });
}

function deleteRoom(room) {
  return new Promise((resolve, reject) => {
    const stmt = `DELETE FROM messages WHERE room = ?`;
    db.run(stmt, [room], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function leaveCurrentRoom(socket) {
  const meta = users.get(socket.id);
  if (!meta) return;
  const { username, room } = meta;

  users.delete(socket.id);
  const members = roomMembers.get(room);
  if (members) {
    members.delete(socket.id);
    if (members.size === 0) roomMembers.delete(room);
    else roomMembers.set(room, members);
  }
  socket.leave(room);

  insertSystem(room, "leave", username)
    .then(({ text }) => {
      const sys = { type: "leave", username, text, time: Date.now(), isSystem: true };
      socket.to(room).emit("system", sys);
      io.to(room).emit("participants", getParticipants(room));
    })
    .catch((e) => console.warn("system leave insert failed:", e.message));
}

function isUsernameTaken(room, username) {
  const members = roomMembers.get(room) || new Set();
  return [...members].some(id => users.get(id)?.username === username);
}

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  db.get("SELECT 1", (err) => {
    if (err) {
      res.status(503).json({ status: "unhealthy", error: err.message });
    } else {
      res.status(200).json({ status: "healthy", uptime: process.uptime() });
    }
  });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  socket.on("join", async ({ username, room }, ack) => {
    if (!username || !room) {
      ack?.({ ok: false, error: "Username and room required" });
      return;
    }

    if (isUsernameTaken(room, username)) {
      ack?.({ ok: false, error: "Username already taken" });
      return;
    }

    const members = roomMembers.get(room) || new Set();
    if (members.size >= ROOM_MAX) {
      ack?.({ ok: false, error: `Room is full (max ${ROOM_MAX})` });
      return;
    }

    socket.join(room);
    users.set(socket.id, { username, room });
    members.add(socket.id);
    roomMembers.set(room, members);

    try {
      const history = await getHistory(room, HISTORY_LIMIT);
      socket.emit("history", history);

      const { text } = await insertSystem(room, "join", username);
      socket.to(room).emit("system", { type: "join", username, text, time: Date.now(), isSystem: true });

      ack?.({ ok: true, min: ROOM_MIN, max: ROOM_MAX });
      io.to(room).emit("participants", getParticipants(room));
    } catch (e) {
      console.error("join error:", e);
      ack?.({ ok: false, error: "Failed to load/join room" });
    }
  });

  socket.on("exitRoom", (ack) => {
    const meta = users.get(socket.id);
    if (!meta) { ack?.({ ok: false, error: "Not in a room" }); return; }
    const prevRoom = meta.room;
    leaveCurrentRoom(socket);
    ack?.({ ok: true, room: prevRoom });
  });

  socket.on("deleteRoom", async (room, ack) => {
    const members = roomMembers.get(room);
    if (members && members.size > 0) {
      ack?.({ ok: false, error: "Room is not empty" });
      return;
    }
    try {
      await deleteRoom(room);
      roomMembers.delete(room);
      ack?.({ ok: true });
      io.emit("roomListUpdated", Array.from(roomMembers.keys()));
    } catch (e) {
      ack?.({ ok: false, error: "Failed to delete room" });
    }
  });

  socket.on("message", async (text) => {
    const meta = users.get(socket.id);
    if (!meta) return;
    const cleaned = String(text || "");
    try {
      await insertMessage(meta.room, meta.username, cleaned);
      io.to(meta.room).emit("message", { from: meta.username, text: cleaned, time: Date.now(), isSystem: false });
    } catch (e) {
      console.warn("message insert failed:", e.message);
    }
  });

  socket.on("typing", (isTyping) => {
    const meta = users.get(socket.id);
    if (!meta) return;
    socket.to(meta.room).emit("typing", { username: meta.username, isTyping: !!isTyping });
  });

  socket.on("disconnect", () => {
    const meta = users.get(socket.id);
    if (!meta) return;
    leaveCurrentRoom(socket);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend on http://0.0.0.0:${PORT} (min ${ROOM_MIN}, max ${ROOM_MAX}), DB: ${SQLITE_PATH}`);
});