import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@salon/shared-types": path.resolve(__dirname, "../../packages/shared-types/src/index.ts"),
      "@salon/shared-utils": path.resolve(__dirname, "../../packages/shared-utils/src/index.ts"),
      "@salon/database": path.resolve(__dirname, "../../packages/database/src/index.ts"),
    },
  },
  server: {
    port: 3002,
  },
});
