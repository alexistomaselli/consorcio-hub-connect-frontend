#!/bin/sh

# Generate environment configuration file from current environment variables
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
echo "  VITE_SUPABASE_URL: \"${VITE_SUPABASE_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_SUPABASE_ANON_KEY: \"${VITE_SUPABASE_ANON_KEY}\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Execute the CMD passed to the container (usually nginx)
exec "$@"
