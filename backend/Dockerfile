FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
        libzip-dev \
        libpq-dev \
        zip \
        unzip \
        git \
    && docker-php-ext-install \
        pdo_pgsql \
        zip \
        bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .
RUN COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --no-scripts --no-interaction --ignore-platform-reqs

RUN chmod -R 777 storage bootstrap/cache

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
