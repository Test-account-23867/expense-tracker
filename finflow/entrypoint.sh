#!/bin/sh
set -e
echo "Running migrations..."
npx prisma@5.15.0 migrate deploy
echo "Seeding database..."
npx prisma@5.15.0 db seed
echo "Starting app..."
exec node server.js