import { defineConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { fileURLToPath } from 'url';
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  server: {
    port: 8084, // Puerto 8084 para el frontend
    host: true,
    // Mantenemos la configuración del proxy por si acaso algún componente aún usa rutas con /api
    // pero la mayoría de las llamadas ahora van directamente al backend sin prefijo
    proxy: {
      '/api': {
        target: process.env.DOCKER_ENV ? 'http://host.docker.internal:3000' : 'http://localhost:3000', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // Elimina el prefijo /api antes de enviarlo al backend
      },
      '/buildings': {
        target: process.env.DOCKER_ENV ? 'http://host.docker.internal:3000' : 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/n8n-webhooks': {
        target: process.env.DOCKER_ENV ? 'http://host.docker.internal:3000' : 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));
