import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
  server: {
    host: "127.0.0.1",
    port: 4321,
  },
});
