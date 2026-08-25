# Lingo Deployment Guide

This guide covers deploying the Lingo extension and backend to production.

## Prerequisites

- Lemon Squeezy account configured
- DNS records configured
- SSL certificates obtained
- Production server(s) available
- Environment variables configured

## Environment Variables

### Backend (.env)

```bash
# Runtime
APP_ENV=production
DEBUG=false

# Public URLs
APP_URL=https://lingo.zaixos.com
API_URL=https://lingo-api.zaixos.com

# Server Configuration
HOST=0.0.0.0
PORT=8004

# Groq API
GROQ_API_KEY=your_production_groq_api_key
TRANSLATION_MODEL=openai/gpt-oss-120b
GROQ_TIMEOUT_SECONDS=15
TRANSLATION_PROMPT_VERSION=v1

# License Enforcement
DEV_SKIP_LICENSE=false

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=your_production_lemon_squeezy_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_PRODUCT_ID=LINGO
LEMON_SQUEEZY_VARIANT_ID=your_monthly_variant_id
FIRST_MONTH_FREE=true

# License Cache
LICENSE_CACHE_TTL=900
INVALID_LICENSE_TTL_SECONDS=90

# Rate Limiting
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_TRANSLATE_PER_MINUTE=40
RATE_LIMIT_LICENSE_PER_MINUTE=20

# CORS (production-specific)
CORS_ORIGINS=https://lingo.zaixos.com,https://lingo-api.zaixos.com
```

### Extension (.env for build)

```bash
# Public build-time API origin
VITE_API_BASE_URL=https://lingo-api.zaixos.com

# Lemon Squeezy checkout URL
VITE_CHECKOUT_URL=https://store.zaixos.com/checkout/buy/[variant-id]
```

## Backend Deployment

### 1. Server Setup

```bash
# SSH into production server
ssh user@lingo-api.zaixos.com

# Create application directory
mkdir -p /opt/lingo-api
cd /opt/lingo-api

# Copy backend files
scp -r backend/* user@lingo-api.zaixos.com:/opt/lingo-api/
```

### 2. Python Environment

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Create .env file
nano .env

# Paste production environment variables
# Save and exit
```

### 4. Systemd Service

Create `/etc/systemd/system/lingo-api.service`:

```ini
[Unit]
Description=Lingo API Service
After=network.target

[Service]
Type=exec
User=lingo
WorkingDirectory=/opt/lingo-api
Environment="PATH=/opt/lingo-api/.venv/bin"
ExecStart=/opt/lingo-api/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8004
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable lingo-api
sudo systemctl start lingo-api
sudo systemctl status lingo-api
```

### 5. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/lingo-api`:

```nginx
server {
    listen 443 ssl http2;
    server_name lingo-api.zaixos.com;

    ssl_certificate /etc/ssl/certs/lingo-api.zaixos.com.crt;
    ssl_certificate_key /etc/ssl/private/lingo-api.zaixos.com.key;

    location / {
        proxy_pass http://127.0.0.1:8004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhooks/lemonsqueezy {
        proxy_pass http://127.0.0.1:8004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/lingo-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Landing Page Deployment

### 1. Build Landing Page

The landing page is a static HTML file. Simply deploy it to your web server:

```bash
# Copy landing page to web server
scp landing.html user@lingo.zaixos.com:/var/www/html/index.html
```

### 2. Nginx Configuration

Create `/etc/nginx/sites-available/lingo`:

```nginx
server {
    listen 443 ssl http2;
    server_name lingo.zaixos.com;

    ssl_certificate /etc/ssl/certs/lingo.zaixos.com.crt;
    ssl_certificate_key /etc/ssl/private/lingo.zaixos.com.key;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/lingo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Extension Build

### 1. Build Chrome Extension

```bash
# Set production environment variables
export VITE_API_BASE_URL=https://lingo-api.zaixos.com
export VITE_CHECKOUT_URL=https://store.zaixos.com/checkout/buy/[variant-id]

# Build Chrome extension
npm run build:chrome
```

### 2. Build Edge Extension

```bash
# Build Edge extension
npm run build:edge
```

### 3. Package Extensions

```bash
# Package Chrome extension
npm run pack:chrome

# Package Edge extension
npm run pack:edge
```

### 4. Verify Build

```bash
# Check for secrets in build
grep -r "GROQ_API_KEY\|gsk_\|LEMON_SQUEEZY_API_KEY" dist/chrome
grep -r "GROQ_API_KEY\|gsk_\|LEMON_SQUEEZY_API_KEY" dist/edge

# Check for localhost references
grep -r "127.0.0.1:8004\|localhost:8004" dist/chrome
grep -r "127.0.0.1:8004\|localhost:8004" dist/edge
```

## Extension Store Submission

### Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create new item
3. Upload `store/lingo-chrome.zip`
4. Fill in store listing:
   - Name: Lingo
   - Description: Write naturally. Translate instantly.
   - Category: Productivity
   - Screenshots: Add screenshots of the extension
5. Set pricing: Free with in-app purchases
6. Submit for review

### Microsoft Edge Add-ons

1. Go to [Microsoft Edge Add-ons Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/publish)
2. Create new extension
3. Upload `store/lingo-edge.zip`
4. Fill in store listing (similar to Chrome)
5. Submit for review

## Lemon Squeezy Configuration

### 1. Create Product

1. Log in to Lemon Squeezy dashboard
2. Create new product: "Lingo Pro"
3. Add variants:
   - Monthly: $6.99/month with first month free trial
   - Annual: $49.99/year

### 2. Configure Webhook

1. Go to Settings → Webhooks
2. Add webhook URL: `https://lingo-api.zaixos.com/webhooks/lemonsqueezy`
3. Select events:
   - subscription_created
   - subscription_updated
   - subscription_cancelled
   - subscription_expired
   - subscription_payment_failed
   - subscription_payment_success
   - subscription_payment_refunded

### 3. Get Variant IDs

1. Copy variant IDs from Lemon Squeezy dashboard
2. Update backend `.env`:
   ```bash
   LEMON_SQUEEZY_VARIANT_ID=your_variant_id
   ```
3. Update extension build environment:
   ```bash
   VITE_CHECKOUT_URL=https://store.zaixos.com/checkout/buy/[variant-id]
   ```

## Monitoring

### Backend Health

```bash
# Check health endpoint
curl https://lingo-api.zaixos.com/api/health

# Check liveness
curl https://lingo-api.zaixos.com/health

# Check service status
sudo systemctl status lingo-api

# View logs
sudo journalctl -u lingo-api -f
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/lingo-api.access.log

# Error logs
sudo tail -f /var/log/nginx/lingo-api.error.log
```

## Rollback Procedure

### Backend Rollback

```bash
# Stop service
sudo systemctl stop lingo-api

# Revert to previous version
cd /opt/lingo-api
git checkout <previous-commit>

# Restart service
sudo systemctl start lingo-api
```

### Extension Rollback

1. Remove current version from store
2. Upload previous version
3. Submit for expedited review

## Security Checklist

- [ ] SSL certificates valid and renewed
- [ ] Firewall configured (only allow 80, 443, 22)
- [ ] API keys stored securely (not in git)
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Debug mode disabled in production
- [ ] Log rotation configured
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured

## Troubleshooting

### Extension Not Connecting to API

1. Check API health: `curl https://lingo-api.zaixos.com/api/health`
2. Check extension manifest host_permissions
3. Check browser console for errors
4. Verify VITE_API_BASE_URL is set correctly

### Webhook Not Receiving Events

1. Check webhook URL in Lemon Squeezy dashboard
2. Check webhook signature verification
3. Check backend logs: `sudo journalctl -u lingo-api -f`
4. Test webhook with Lemon Squeezy webhook tester

### Payment Not Activating Pro

1. Check webhook events are being received
2. Check subscription status in backend logs
3. Verify license activation logic
4. Check client-side license cache
