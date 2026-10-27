import { app } from './app.js';
import { config } from './config/index.js';
import { testConnection } from './database/pool.js';
import { loadConfigFromSSM } from './config/ssm.js';
import { startWorkerLoop } from './workers/documentWorker.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    logger.info('====================================================');
    logger.info('Starting MediCloud Healthcare Backend Server...');
    logger.info(`Environment: ${config.env} | Port: ${config.port}`);
    logger.info(`Cloud Integration Mode: ${config.aws.useLocalCloudMocks ? 'LOCAL_EMULATION' : 'AWS_NATIVE'}`);
    logger.info('====================================================');

    // 1. Fetch AWS Systems Manager Parameter Store parameters if in cloud
    await loadConfigFromSSM();

    // 2. Test PostgreSQL Database connectivity
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('CRITICAL: Unable to establish database connection. Retrying in 5 seconds...');
      setTimeout(bootstrap, 5000);
      return;
    }

    // 3. Start background document processing worker loop
    startWorkerLoop(3000);

    // 4. Start HTTP Server
    const server = app.listen(config.port, () => {
      logger.info(`MediCloud API Server is actively listening on port ${config.port}`);
      logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down MediCloud server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal error during application startup:', error);
    process.exit(1);
  }
}

bootstrap();
