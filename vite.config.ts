import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/",
    plugins: [react()],
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "lucide-react", "@google/genai"],
          },
        },
      },
    },

    define: {
      // Inject API Key from Environment Variables
      "process.env.API_KEY": JSON.stringify(env.API_KEY || env.VITE_API_KEY || ""),

      // Fix: process.env must be valid JSON, NOT '({})'
      "process.env": {},
    },
  };
});
