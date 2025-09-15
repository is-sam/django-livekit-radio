# Python 3.12 slim image
FROM python:3.12-slim

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files (if needed)
RUN python manage.py collectstatic --noinput || true

# Set environment variables
ENV DJANGO_SETTINGS_MODULE=config.settings

# Expose port (Daphne default)
EXPOSE 8000

# Start server (ASGI)
CMD ["daphne", "config.asgi:application", "-b", "0.0.0.0", "-p", "8000"]
