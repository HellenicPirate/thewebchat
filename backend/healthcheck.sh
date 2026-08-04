#!/bin/sh
# Docker healthcheck script for backend
if wget --no-verbose --tries=1 --spider http://localhost:3000/health 2>/dev/null; then
  exit 0
else
  exit 1
fi