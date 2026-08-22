#!/bin/bash
# PomoMate — Database Backup Script
# Run daily via cron

set -e

BACKUP_DIR="/home/ubuntu/pomomate/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pomomate_backup_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "🗄️ Starting database backup..."

# Backup PostgreSQL database
pg_dump -h localhost -U pomomate_user pomomate | gzip > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "pomomate_backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned"
