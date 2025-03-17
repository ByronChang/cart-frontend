
# Fase de construcción
FROM node:20-alpine as build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Pasar la variable de entorno durante la construcción
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Construir la aplicación
RUN npm run build

# Fase de producción - usar nginx para servir la aplicación
FROM nginx:alpine

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la fase de build
COPY --from=build /app/dist /usr/share/nginx/html

# Script para inicializar variables de entorno en tiempo de ejecución
RUN echo 'window.ENV = { API_URL: "http://localhost:8080/api" };' > /usr/share/nginx/html/env-config.js && \
    echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'if [ -n "$VITE_API_URL" ]; then' >> /docker-entrypoint.sh && \
    echo '  echo "window.ENV = { API_URL: \"$VITE_API_URL\" };" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh && \
    echo '  echo "Variable de entorno VITE_API_URL actualizada: $VITE_API_URL"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar el script de entrada
CMD ["/docker-entrypoint.sh"]
