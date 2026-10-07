import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function downloadApiPlugin() {
  return {
    name: 'download-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/download/export' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              let filename = 'download.txt';
              let mimeType = 'text/plain; charset=utf-8';
              let content = '';

              if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
                const params = new URLSearchParams(body);
                filename = params.get('filename') || 'download.txt';
                mimeType = params.get('mimeType') || 'text/plain; charset=utf-8';
                content = params.get('content') || '';
              } else {
                const parsed = JSON.parse(body);
                filename = parsed.filename || 'download.txt';
                mimeType = parsed.mimeType || 'text/plain; charset=utf-8';
                content = parsed.content || '';
              }

              res.setHeader('Content-Type', mimeType);
              res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
              res.end(content);
            } catch (err) {
              res.statusCode = 500;
              res.end('Error processing download');
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      downloadApiPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
