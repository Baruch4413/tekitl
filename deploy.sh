#!/bin/bash
set -e

exec >> /var/log/tekitl-deploy.log 2>&1

REPO_DIR="/var/www/html/tekitl"
export PATH="/root/.nvm/versions/node/v25.2.1/bin:$PATH"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

echo "${LOG_PREFIX} === Deploy started ==="

cd "${REPO_DIR}"

echo "${LOG_PREFIX} Pulling latest code..."
git pull origin main

echo "${LOG_PREFIX} Installing PHP dependencies..."
COMPOSER_ALLOW_SUPERUSER=1 php8.5 /usr/bin/composer install --no-interaction --prefer-dist --optimize-autoloader

echo "${LOG_PREFIX} Installing JS dependencies..."
npm ci --prefer-offline

echo "${LOG_PREFIX} Building assets..."
npm run build

echo "${LOG_PREFIX} Running migrations..."
php artisan migrate --force

echo "${LOG_PREFIX} Caching config, routes, views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "${LOG_PREFIX} === Deploy complete ==="
