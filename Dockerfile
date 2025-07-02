# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .

# Construir aplicación
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Instalar dependencias adicionales si es necesario
RUN apk add --no-cache bash

# Copiar la plantilla de configuración de nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copiar los archivos de build desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Establecer variable de entorno para desarrollo local por defecto
ENV BACKEND_HOST=http://backend:3000

EXPOSE 8084

# Script de inicio para reemplazar variables en el template
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
