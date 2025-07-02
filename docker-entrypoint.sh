#!/bin/bash
set -e

# Reemplazar variables de entorno en el template
envsubst '$$BACKEND_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Iniciar Nginx
exec nginx -g "daemon off;"
