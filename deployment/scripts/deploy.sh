#!/bin/bash
# PomoMate — Production Deployment Script
# Run on Abacus SuperComputer

set -e

echo "🚀 PomoMate Deployment Starting..."

# Navigate to project root
cd /home/ubuntu/pomomate

# Pull latest code (if using git)
# git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd server
npm ci --only=production
cd ..

# Build backend
echo "🔨 Building backend..."
cd server
npm run build
cd ..

# Run database migrations
echo "🗄️ Running migrations..."
# psql -h localhost -U pomomate_user -d pomomate -f server/migrations/001_initial_schema.sql
# psql -h localhost -U pomomate_user -d pomomate -f server/migrations/002_rls_policies.sql
# psql -h localhost -U pomomate_user -d pomomate -f server/migrations/003_storage_buckets.sql

# Restart PM2 processes
echo "♻️ Restarting services..."
pm2 reload deployment/config/ecosystem.config.js --update-env

# Save PM2 state
pm2 save

echo "✅ Deployment complete!"
echo "📊 Service status:"
pm2 status
