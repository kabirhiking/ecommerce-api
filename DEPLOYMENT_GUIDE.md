# 🚀 Production Deployment Guide

## Overview
This guide walks you through deploying your e-commerce application with admin panel to production environments.

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change default admin password
- [ ] Set strong SECRET_KEY for JWT tokens
- [ ] Configure CORS for production domains
- [ ] Review and secure all API endpoints
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up proper database backups

### Environment Configuration
- [ ] Create production environment files
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Configure environment variables
- [ ] Set up domain and DNS
- [ ] Configure reverse proxy (Nginx recommended)

### Code Preparation
- [ ] Run database migrations
- [ ] Build frontend for production
- [ ] Test all admin functionality
- [ ] Verify API endpoints work correctly
- [ ] Check mobile responsiveness

## 🏗️ Deployment Options

### Option 1: VPS/Dedicated Server Deployment

#### System Requirements
```bash
# Minimum server specifications
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- OS: Ubuntu 20.04 LTS or newer
- Python 3.8+
- Node.js 16+
```

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y
```

#### 2. Database Setup (PostgreSQL)
```bash
# Create database user
sudo -u postgres createuser --interactive --pwprompt ecommerce

# Create database
sudo -u postgres createdb ecommerce --owner=ecommerce

# Update connection string in production
# DATABASE_URL=postgresql://ecommerce:password@localhost/ecommerce
```

#### 3. Backend Deployment
```bash
# Clone repository
git clone <your-repo-url>
cd ecommerce-api

# Create virtual environment
python3 -m venv env
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production environment file
cat > .env << EOF
SECRET_KEY=your_super_secure_secret_key_for_production_change_this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://ecommerce:password@localhost/ecommerce
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DEBUG=False
EOF

# Run database migrations
python migrate_db.py

# Install Gunicorn for production WSGI server
pip install gunicorn

# Create systemd service
sudo tee /etc/systemd/system/ecommerce-api.service << EOF
[Unit]
Description=E-Commerce API
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/ecommerce-api
Environment=PATH=/home/ubuntu/ecommerce-api/env/bin
ExecStart=/home/ubuntu/ecommerce-api/env/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start and enable service
sudo systemctl daemon-reload
sudo systemctl start ecommerce-api
sudo systemctl enable ecommerce-api
```

#### 4. Frontend Deployment
```bash
# Build frontend
cd ecommerce-frontend
npm install
npm run build

# Copy build files to web directory
sudo mkdir -p /var/www/ecommerce
sudo cp -r dist/* /var/www/ecommerce/
sudo chown -R www-data:www-data /var/www/ecommerce
```

#### 5. Nginx Configuration
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/ecommerce << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/ecommerce;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Admin API
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Authentication API
    location /auth {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL/HTTPS Setup with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Option 2: Docker Deployment

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: ecommerce
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      - DATABASE_URL=postgresql://ecommerce:your_secure_password@db/ecommerce
      - SECRET_KEY=your_super_secure_secret_key
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build:
      context: ./ecommerce-frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Backend Dockerfile
```dockerfile
# Dockerfile.api
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile
```dockerfile
# ecommerce-frontend/Dockerfile
FROM node:16-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Cloud Platform Deployment

#### Heroku Deployment
```bash
# Install Heroku CLI
# Create Procfile (already exists in your project)
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy to Heroku
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SECRET_KEY=your_secure_key
git push heroku main
heroku run python migrate_db.py
```

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add --database postgresql
railway deploy
```

#### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: ecommerce-app
services:
- name: api
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port 8000
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: SECRET_KEY
    value: your_secret_key
    type: SECRET
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
    type: SECRET

- name: frontend
  source_dir: /ecommerce-frontend
  github:
    repo: your-username/your-repo
    branch: main
  build_command: npm run build
  run_command: npx serve -s dist -l 8080
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: db
  engine: PG
  version: "13"
```

## 🔧 Production Configuration Updates

### Backend Updates
```python
# app/main.py - Update CORS for production
from fastapi.middleware.cors import CORSMiddleware
import os

# Get allowed origins from environment variable
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Updates
```javascript
// src/api.js - Update API base URL for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:8000';
```

### Environment Variables
```bash
# Production environment variables
SECRET_KEY=your_super_secure_random_secret_key_change_this_in_production
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

## 📊 Monitoring and Maintenance

### Health Checks
```python
# Add to app/main.py
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
```

### Logging Configuration
```python
# app/main.py
import logging
import sys

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
```

### Database Backup Script
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/ecommerce_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U ecommerce -d ecommerce > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Monitoring Setup
```bash
# Install and configure monitoring tools
sudo apt install htop iotop -y

# Set up log rotation
sudo tee /etc/logrotate.d/ecommerce << EOF
/home/ubuntu/ecommerce-api/app.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
    - name: Run tests
      run: |
        python -m pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /home/ubuntu/ecommerce-api
          git pull origin main
          source env/bin/activate
          pip install -r requirements.txt
          sudo systemctl restart ecommerce-api
          cd ../ecommerce-frontend
          npm install
          npm run build
          sudo cp -r dist/* /var/www/ecommerce/
```

## 🔒 Security Best Practices

### Server Security
```bash
# Basic server hardening
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Disable password authentication (use SSH keys)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install fail2ban to prevent brute force attacks
sudo apt install fail2ban -y
```

### Application Security
```python
# Add security headers
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com", "*.yourdomain.com"])
app.add_middleware(HTTPSRedirectMiddleware)
```

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Check connection
psql -h localhost -U ecommerce -d ecommerce
```

#### API Not Starting
```bash
# Check service logs
sudo journalctl -u ecommerce-api -f

# Check if port is in use
sudo netstat -tulpn | grep :8000
```

#### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_user_id ON orders(user_id);
```

#### Nginx Caching
```nginx
# Add to Nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

**Your e-commerce application with admin panel is now ready for production! 🎉**

Remember to:
1. **Always backup your database** before making changes
2. **Monitor your application** regularly
3. **Keep dependencies updated** for security
4. **Test thoroughly** before deploying changes
5. **Document any customizations** you make

Good luck with your deployment! 🚀
