import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(path.resolve(__dirname, "tailwind.config.cjs")),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      "@salon/shared-types": path.resolve(
        __dirname,
        "../../packages/shared-types/src/index.ts",
      ),
      "@salon/shared-utils": path.resolve(
        __dirname,
        "../../packages/shared-utils/src/index.ts",
      ),
      "@salon/database": path.resolve(
        __dirname,
        "../../packages/database/src/index.ts",
      ),
    },
  },
  server: {
    port: 3002,
    host: true,
  },
});
