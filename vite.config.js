import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { existsSync, createReadStream, statSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputsDir = path.resolve(__dirname, '../outputs')

// Middleware that serves ../outputs/ at /local-data/ so dev can work without HF
function localDataPlugin() {
  return {
    name: 'local-data-server',
    configureServer(server) {
      server.middlewares.use('/local-data', (req, res, next) => {
        const filePath = path.join(outputsDir, req.url)
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const ext = path.extname(filePath)
          const mime = ext === '.json' ? 'application/json'
            : ext === '.png' ? 'image/png' : 'application/octet-stream'
          res.setHeader('Content-Type', mime)
          res.setHeader('Access-Control-Allow-Origin', '*')
          createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), localDataPlugin()],
  base: './',
  optimizeDeps: {
    include: ['plotly.js-dist-min'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/plotly')) return 'plotly';
          if (id.includes('react-force-graph') || id.includes('force-graph')) return 'fg3d';
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  server: {
    proxy: {
      '/hf-proxy': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/hf-proxy/, ''),
        secure: true,
      },
    },
  },
}))
