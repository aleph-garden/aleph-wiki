import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  resolve: {
    preserveSymlinks: false
  },
  server: {
    fs: {
      // Allow serving files from the parent directory and symlinked locations
      allow: ['..', '/home/toph/aleph-wiki']
    }
  },
  assetsInclude: ['**/*.ttl', '**/*.rdf'],
  plugins: [
    {
      name: 'rdf-loader',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Handle /api/file endpoint for absolute paths
          if (req.url && req.url.startsWith('/api/file')) {
            const url = new URL(req.url, 'http://localhost')
            const filePath = url.searchParams.get('path')

            if (filePath) {
              try {
                let fullPath

                // Handle different path formats
                if (filePath.startsWith('~')) {
                  // Expand ~ to home directory
                  fullPath = filePath.replace(/^~/, process.env.HOME || '/home/toph')
                } else if (filePath.startsWith('/')) {
                  // Check if it's in public dir first
                  const publicPath = path.join(server.config.publicDir, filePath)
                  if (fs.existsSync(publicPath)) {
                    fullPath = publicPath
                  } else {
                    // Otherwise treat as absolute path
                    fullPath = filePath
                  }
                } else {
                  // Relative path - join with public dir
                  fullPath = path.join(server.config.publicDir, filePath)
                }

                if (fs.existsSync(fullPath)) {
                  const realPath = fs.realpathSync(fullPath) // Resolve symlinks
                  const content = fs.readFileSync(realPath, 'utf-8')

                  res.setHeader('Content-Type', 'text/turtle; charset=utf-8')
                  res.setHeader('Access-Control-Allow-Origin', '*')
                  res.end(content)
                  return
                }
              } catch (error) {
                console.error('Error reading file:', error)
              }
            }

            res.statusCode = 404
            res.end('File not found')
            return
          }

          // Handle direct .ttl/.rdf file requests
          if (req.url && (req.url.endsWith('.ttl') || req.url.endsWith('.rdf'))) {
            const filePath = path.join(server.config.publicDir, req.url.split('?')[0])

            // Check if file exists and read it
            if (fs.existsSync(filePath)) {
              const realPath = fs.realpathSync(filePath) // Resolve symlinks
              const content = fs.readFileSync(realPath, 'utf-8')

              res.setHeader('Content-Type', 'text/turtle; charset=utf-8')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(content)
              return
            }
          }
          next()
        })
      }
    }
  ]
})
