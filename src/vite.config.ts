import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Dynamically import tailwindcss plugin
async function getTailwindPlugin() {
  const { default: tailwindcss } = await import("@tailwindcss/vite")
  return tailwindcss()
}

export default defineConfig(async () => ({
  plugins: [react(), await getTailwindPlugin()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
}))