# PomoMate — Production Deployment

## Prerequisites

- Abacus SuperComputer instance
- Node.js 20+
- PostgreSQL 15
- PM2 (`npm install -g pm2`)
- Nginx
- Certbot (for SSL)

## Initial Setup

### 1. Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-org/pomomate.git
cd pomomate
```

### 2. Install Dependencies

```bash
cd server
npm ci --only=production
npm run build
cd ..
```

### 3. Setup PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE pomomate;
CREATE USER pomomate_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pomomate TO pomomate_user;
\q
```

### 4. Run Migrations

```bash
psql -h localhost -U pomomate_user -d pomomate -f server/migrations/001_initial_schema.sql
psql -h localhost -U pomomate_user -d pomomate -f server/migrations/002_rls_policies.sql
psql -h localhost -U pomomate_user -d pomomate -f server/migrations/003_storage_buckets.sql
```

### 5. Configure Environment

```bash
cp .env.production.example .env.production
nano .env.production
# Fill in actual values
```

### 6. Setup Nginx

```bash
sudo cp deployment/nginx/pomomate.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/pomomate.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d api.pomomate.app
```

### 8. Start Services

```bash
pm2 start deployment/config/ecosystem.config.js
pm2 save
pm2 startup
```

## Deployment

### Deploy Latest Code

```bash
chmod +x deployment/scripts/deploy.sh
./deployment/scripts/deploy.sh
```

### Backup Database

```bash
chmod +x deployment/scripts/backup.sh
./deployment/scripts/backup.sh
```

### Setup Automated Backups

```bash
crontab -e
# Add: 0 2 * * * /home/ubuntu/pomomate/deployment/scripts/backup.sh
```

## Monitoring

### Check Service Status

```bash
pm2 status
pm2 logs pomomate-backend
```

### Monitor Resources

```bash
pm2 monit
```

### Health Check

```bash
curl https://api.pomomate.app/health
```

## Docker Deployment (Alternative)

```bash
cd deployment/docker
docker-compose up -d
docker-compose logs -f
```

## Security

- Keep `.env.production` private
- Use strong database passwords
- Rotate JWT secrets periodically
- Keep SSL certificates up to date

## Support

For issues, contact: dev@pomomate.app
