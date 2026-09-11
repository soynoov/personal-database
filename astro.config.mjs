import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import gamesSync from "./scripts/integrations/games-sync.mjs";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [gamesSync()],
  devToolbar: {
    enabled: false,
  },
  server: {
    host: "127.0.0.1",
    port: 4321,
  },
});
