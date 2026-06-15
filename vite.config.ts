import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const appTitle = process.env.VITE_APP_TITLE || "Graciosa Studio de Beleza";

const plugins = [
  react(),
  tailwindcss(),
  vitePluginManusRuntime(),
  VitePWA({
    strategies: "injectManifest",
    srcDir: "src",
    filename: "sw.ts",
    registerType: "autoUpdate",
    includeAssets: ["image/favicon.png", "image/Logo.png"],
    manifest: {
      name: appTitle,
      short_name: appTitle,
      description: "Sistema de agendamento para salão de beleza",
      theme_color: "#0f172a",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      icons: [
        {
          src: "/image/favicon.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/image/favicon.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    devOptions: {
      enabled: true,
    },
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@server": path.resolve(import.meta.dirname, "server"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Avisa no console se algum chunk ficar maior que 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Separa bibliotecas grandes em chunks próprios para melhor cache do browser.
        // Ex: ao atualizar só o código da aplicação, o chunk 'vendor' permanece em cache.
        manualChunks: {
          // React e React DOM separados — quase nunca mudam
          vendor: ["react", "react-dom"],
          // Biblioteca de gráficos (recharts é pesada ~400KB)
          charts: ["recharts"],
          // Validação de schemas
          zod: ["zod"],
        },
      },
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    allowedHosts: [
      ".manus.computer",
      ".manuspre.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
