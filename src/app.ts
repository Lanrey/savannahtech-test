import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
// import { container } from 'tsyringe';
import bootstrapApp from './bootstrap';
import RouteVersion from '@config/route.config';
import appRoute from './v1/modules/app/app.route';
import healthRoute from './v1/modules/health/health.route';
// import { RedisClient } from '@shared/redis-client/redis-client';
import configRoute from './v1/modules/github/routes/config';
import repoRoute from './v1/modules/github/routes/repo';

class App {
  private fastify: FastifyInstance<Server, IncomingMessage, ServerResponse>;

  constructor() {
    this.fastify = fastify({ logger: false, bodyLimit: 5 * 1024 * 1024 }); // body limit is 5MB

    bootstrapApp(this.fastify);

    this.registerModules();
  }

  private registerModules() {
    this.fastify.register(appRoute);
    this.fastify.register(healthRoute);
    this.fastify.register(configRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(repoRoute, { prefix: RouteVersion.v1 });
  }

  public getInstance() {
    return this.fastify;
  }

  public async close() {
    await this.fastify.close();

    //await container.resolve(RedisClient).close();
  }

  public listen(port: number, address = '0.0.0.0') {
    return this.fastify.listen(port, address);
  }
}

export default App;
