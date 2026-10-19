import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Serves the layout fixture for `playwright test`; not published.
export default defineConfig({
  root: "e2e/fixture",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": new URL("../src", import.meta.url).pathname } },
});
