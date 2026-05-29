import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_ITEMS = [
  { id: '1', name: 'Alpha Widget', category: 'hardware' },
  { id: '2', name: 'Beta Service', category: 'software' },
  { id: '3', name: 'Gamma Plan', category: 'software' },
];

function mockListApiMiddleware(req, res, next) {
  if (!req.url?.startsWith('/api/items')) {
    next();
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ items: DEFAULT_ITEMS }));
}

function listApiPlugin() {
  return {
    name: 'list-api-mock',
    configureServer(server) {
      server.middlewares.use(mockListApiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(mockListApiMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), listApiPlugin()],
});
