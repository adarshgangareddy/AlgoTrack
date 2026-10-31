// backend/src/server.ts

import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n==============================================`);
  console.log(`  🚀 ALGOTRACK BACKEND API SERVER RUNNING`);
  console.log(`  📡 Port:       http://localhost:${env.PORT}`);
  console.log(`  🩺 Health:     http://localhost:${env.PORT}/api/health`);
  console.log(`  🌐 Frontend:   ${env.FRONTEND_URL}`);
  console.log(`  ⚙️ Environment: ${env.NODE_ENV}`);
  console.log(`==============================================\n`);
});

// Graceful Shutdown Handlers
process.on('SIGTERM', () => {
  console.log('[Backend] SIGTERM received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('[Backend] HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Backend] SIGINT received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('[Backend] HTTP server closed.');
    process.exit(0);
  });
});

