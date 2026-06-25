FROM php:8.3-cli-alpine

# Install system deps + PHP extensions
RUN apk add --no-cache \
        zip \
        libzip-dev \
        unzip \
        git \
        postgresql-dev \
    && docker-php-ext-install \
        pdo \
        pdo_sqlite \
        pdo_mysql \
        pdo_pgsql \
        zip \
        bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy app and install PHP deps
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare SQLite file + permissions
RUN mkdir -p database \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
