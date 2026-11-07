import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost/sdlhub-backend",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },

      // Proxy for viewing documents
      "/view_document.php": {
        target: "http://localhost/sdlhub-backend/api/common/view_document.php",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/view_document\.php/, ""),
      },
      
    },
  },
});
