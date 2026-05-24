import { defineConfig } from "vite";
import { resolve } from "node:path";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    emptyOutDir: false,
    rollupOptions: { external: ["solid-js", "solid-js/store", "solid-js/web", "zod"] },
  },
});