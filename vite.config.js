import { defineConfig } from "vite";

const origin = process.env.DDEV_PRIMARY_URL || "http://localhost";
console.log(`Vite is using origin: ${origin}`);

export default defineConfig({
  root: "client/src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173, // Vite port
    strictPort: true,
    origin: origin,
    proxy: {
      "/api": {
        target: `${origin.replace(":8443", ":7860")}`, // Target Fastify port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
