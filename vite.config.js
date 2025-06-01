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
    host: true,
    port: 3000,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "de885a4b-d886-4a17-9372-6791449191cc-00-sk4u39m5xe4b.picard.replit.dev",
    ],
  },
  build: {
    outDir: "dist",
  },
  // base: "/paper-dashboard-react/",
});
