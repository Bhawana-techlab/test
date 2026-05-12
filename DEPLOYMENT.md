# 🚀 PropEstate — VPS Deployment Guide
## Ubuntu 22.04 LTS + PostgreSQL + Next.js + Nginx + PM2

---

## STEP 1 — Update VPS

```bash
ssh root@YOUR_VPS_IP
apt update && apt upgrade -y
```

---

## STEP 2 — Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version   # should show v20.x
npm --version
```

---

## STEP 3 — Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER realestate_user WITH PASSWORD 'YourStrongPassword123!';
CREATE DATABASE realestate_db OWNER realestate_user;
GRANT ALL PRIVILEGES ON DATABASE realestate_db TO realestate_user;
\q
EOF

# Test connection
psql -U realestate_user -d realestate_db -h localhost
# Type \q to exit
```

---

## STEP 4 — Install Nginx & PM2

```bash
apt install -y nginx
npm install -g pm2
```

---

## STEP 5 — Install Git & Clone Project

```bash
apt install -y git

# Create directory
mkdir -p /var/www
cd /var/www

# Clone your repo (or upload via SFTP)
git clone https://github.com/YOUR_USERNAME/propestate.git
cd propestate
```

---

## STEP 6 — Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in these values:
```
DATABASE_URL="postgresql://realestate_user:YourStrongPassword123!@localhost:5432/realestate_db"
JWT_SECRET="your-32-char-random-secret-here-abc123xyz"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="Admin@SecurePass123"
NODE_ENV="production"
```

Save and exit: `Ctrl+X → Y → Enter`

---

## STEP 7 — Install Dependencies & Setup Database

```bash
cd /var/www/propestate
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed admin user
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

---

## STEP 8 — Build Next.js

```bash
npm run build
```

This will take 2-3 minutes. You should see:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

---

## STEP 9 — Start with PM2

```bash
pm2 start ecosystem.config.js

# Check status
pm2 status
pm2 logs propestate

# Save PM2 processes (auto-restart on reboot)
pm2 save
pm2 startup
# Run the command it gives you
```

---

## STEP 10 — Configure Nginx

```bash
nano /etc/nginx/sites-available/propestate
```

Paste this config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Max upload size (for property images)
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/propestate /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx
```

---

## STEP 11 — SSL Certificate (HTTPS) — FREE with Certbot

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

After SSL, your Nginx will auto-update to handle HTTPS!

---

## STEP 12 — Setup Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## ✅ DONE! Your site is live at https://yourdomain.com

---

## Useful Commands After Deployment

```bash
# View live logs
pm2 logs propestate

# Restart app
pm2 restart propestate

# Update code (after git push)
cd /var/www/propestate
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart propestate

# Database backup
pg_dump -U realestate_user -h localhost realestate_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U realestate_user -h localhost realestate_db < backup_20240101.sql

# Check database
sudo -u postgres psql -d realestate_db
\dt   # list tables
\q    # exit
```

---

## Troubleshooting

### App not starting?
```bash
pm2 logs propestate --lines 50
# Check .env file is correct
cat /var/www/propestate/.env
```

### Database connection error?
```bash
# Test connection
psql "postgresql://realestate_user:YourPassword@localhost:5432/realestate_db"
```

### Nginx 502 Bad Gateway?
```bash
# Check if Next.js is running on port 3000
pm2 status
curl http://localhost:3000
```

### Images not uploading?
```bash
# Check Cloudinary credentials in .env
# Check file size limit in nginx.conf (client_max_body_size 20M)
```

---

## Folder Structure on VPS

```
/var/www/propestate/     ← Your project
├── .env                 ← Production env (NEVER commit this)
├── .next/               ← Build output
├── prisma/
│   ├── schema.prisma
│   └── migrations/      ← Auto-generated DB migrations
├── src/
│   ├── app/             ← Pages + API routes
│   ├── components/
│   └── lib/
├── ecosystem.config.js  ← PM2 config
└── package.json
```

---

## Monthly Maintenance Checklist

- [ ] `git pull && npm run build && pm2 restart propestate`
- [ ] `pg_dump ...` — take database backup
- [ ] `certbot renew` — SSL renewal (auto, but verify)
- [ ] `pm2 logs` — check for errors
- [ ] `df -h` — check disk space
