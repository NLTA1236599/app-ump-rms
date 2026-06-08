import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const assetsTestDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../assets-test',
);

function assetsTestPlugin(): Plugin {
  return {
    name: 'assets-test-static',
    configureServer(server) {
      server.middlewares.use('/assets-test', (req, res) => {
        const urlPath = (req.url ?? '/').split('?')[0];
        const relativePath = decodeURIComponent(urlPath.replace(/^\/+/, ''));
        if (!relativePath || relativePath.includes('..')) {
          res.statusCode = 400;
          res.end('Bad request');
          return;
        }

        const filePath = path.resolve(assetsTestDir, relativePath);
        if (!filePath.startsWith(path.resolve(assetsTestDir))) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        res.setHeader('Content-Disposition', 'attachment');
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), assetsTestPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
