// @ts-check
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import react from "@astrojs/react"

import vercel from "@astrojs/vercel"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      https: {
        cert: './localhost.pem',
        key: './localhost-key.pem',
      },
    },
  },
  server: {
    port: 4322,
  },
  integrations: [react()],
  adapter: vercel(),
})
