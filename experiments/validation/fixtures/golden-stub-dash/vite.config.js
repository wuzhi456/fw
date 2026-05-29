import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_KPIS = [
  { id: 'users', label: 'Active Users', value: '1,284' },
  { id: 'revenue', label: 'Revenue', value: '$42.1k' },
  { id: 'orders', label: 'Orders', value: '318' },
  { id: 'uptime', label: 'Uptime', value: '99.9%' },
];

function mockDashApiMiddleware(req, res, next) {
  if (req.url?.startsWith('/api/kpis')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ kpis: DEFAULT_KPIS }));
    return;
  }
  if (req.url?.startsWith('/api/cards')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ cards: [{ id: '1', title: 'Recent activity' }] }));
    return;
  }
  next();
}

function dashApiPlugin() {
  return {
    name: 'dash-api-mock',
    configureServer(server) {
      server.middlewares.use(mockDashApiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(mockDashApiMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), dashApiPlugin()],
});
