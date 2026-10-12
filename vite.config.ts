import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
