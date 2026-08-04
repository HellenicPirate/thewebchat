FROM node:20-alpine

# Install build dependencies for sqlite3 native addon
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy application code
COPY server.js ./
COPY healthcheck.sh /usr/local/bin/healthcheck.sh

# Make healthcheck executable and create writable /data directory
RUN chmod +x /usr/local/bin/healthcheck.sh && \
    mkdir -p /data && \
    chmod 1777 /data

EXPOSE 3000

CMD ["node", "server.js"]