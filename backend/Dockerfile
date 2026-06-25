FROM php:8.4-cli

# Install sistem deps + ekstensi PHP yang dibutuhkan
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

# Copy composer files dulu (layer tersendiri) supaya dependency install tidak
# diulang setiap kali source code berubah (Docker layer cache).
COPY composer.json composer.lock ./

RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
        --no-dev \
        --no-scripts \
        --no-interaction \
        --prefer-dist \
        --optimize-autoloader \
        --ignore-platform-reqs

# Baru copy seluruh source code
COPY . .

RUN chmod -R 777 storage bootstrap/cache

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
