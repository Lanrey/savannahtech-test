import 'dotenv/config';
import 'reflect-metadata';
import 'module-alias/register';
import App from './app';
import appConfig from './config/app.config';
import logger from './shared/utils/logger';

const app = new App();

process
  .on('uncaughtException', (err) => {
    logger.error({ err });
    app.close();
    process.exit(1);
  })
  .on('SIGINT', () => {
    app.close();
    process.exit(0);
  });

async function startServer() {
  try {
    await app.initialize();
    const address = await app.listen(appConfig.server.port);
    logger.info(`${appConfig.app.name} started on ${address}`);
  } catch (error) {
    logger.error({ error });
    process.exit(1);
  }
}

startServer();
