FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
        libzip-dev \
        libpq-dev \
        zip \
        unzip \
        git \
    && docker-php-ext-install \
        pdo \
        pdo_sqlite \
        pdo_pgsql \
        zip \
        bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p database \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
