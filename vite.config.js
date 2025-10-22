import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      assets: path.resolve(__dirname, "./src/assets"),
      components: path.resolve(__dirname, "./src/components"),
      variables: path.resolve(__dirname, "./src/variables"),
      views: path.resolve(__dirname, "./src/views"),
      layouts: path.resolve(__dirname, "./src/layouts"),
    },
  },
  server: {
    host: "0.0.0.0",
    // port: 3000, // Removed to let the hosting environment assign the port
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  // base: "/paper-dashboard-react/",
});
