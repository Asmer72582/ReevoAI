import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    nitro({
      preset: process.env.VERCEL ? "vercel" : undefined,
      vercel: {
        entryFormat: "node",
      },
      nodeModulesDirs: [".", "./backend"],
      externals: {
        external: ["ffmpeg-static"],
      },
    }),
  ],
});
