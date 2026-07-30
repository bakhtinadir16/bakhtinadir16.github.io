import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

// Dev helper: POST a base64 image and it gets saved into public/.
// Used for grabbing project screenshots, not part of the build.
const saveShot = (): Plugin => ({
  name: "save-shot",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/__save-shot", (req, res) => {
      const url = new URL(req.url ?? "", "http://localhost");
      const name = url.searchParams.get("name") ?? "";
      if (req.method !== "POST" || !/^[a-z0-9-]+\.(png|jpg)$/.test(name)) {
        res.statusCode = 400;
        res.end("bad request");
        return;
      }
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        fs.writeFileSync(
          path.join(__dirname, "public", name),
          Buffer.from(body, "base64")
        );
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end("ok");
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), saveShot()],
  server: {
    // use PORT if it's set, otherwise vite's default
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          animation: ["gsap", "framer-motion"],
          hls: ["hls.js"],
        },
      },
    },
  },
});
