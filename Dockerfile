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

# Copiar ambas configuraciones
COPY nginx.conf /etc/nginx/nginx.conf.local
COPY nginx.conf.server /etc/nginx/nginx.conf.server

# Argumento para decidir qué configuración usar, por defecto "local"
ARG DEPLOY_ENV=local

# Copiar la configuración correcta según el entorno
RUN if [ "$DEPLOY_ENV" = "server" ]; then \
        cp /etc/nginx/nginx.conf.server /etc/nginx/conf.d/default.conf; \
    else \
        cp /etc/nginx/nginx.conf.local /etc/nginx/conf.d/default.conf; \
    fi

# Copiar los archivos de build desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
