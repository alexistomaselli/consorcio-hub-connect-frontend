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
    port: 8085, // Puerto 8085 para el frontend
    host: true,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));
