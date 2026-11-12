FROM nginx:alpine

# Node.js solo se usa para el proxy /api/gemini (sin dependencias npm).
RUN apk add --no-cache nodejs

# Configuración de Nginx con el proxy hacia el proceso Node local.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Solo se publican los archivos estáticos; el código del servidor no se sirve.
COPY index.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY assets /usr/share/nginx/html/assets
COPY data /usr/share/nginx/html/data

COPY server /app/server
COPY docker/40-gemini-proxy.sh /docker-entrypoint.d/40-gemini-proxy.sh
RUN chmod +x /docker-entrypoint.d/40-gemini-proxy.sh

ENV PORT=3000
EXPOSE 80
