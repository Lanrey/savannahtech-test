/*
import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import bootstrapApp from './bootstrap';
import RouteVersion from '@config/route.config';
import appRoute from './v1/modules/app/app.route';
import healthRoute from './v1/modules/health/health.route';
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
  }

  public listen(port: number, address = '0.0.0.0') {
    return this.fastify.listen(port, address);
  }
}

export default App;
*/

import 'dotenv/config';
import 'reflect-metadata';
import 'module-alias/register';
import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { container } from 'tsyringe';
import cors from '@fastify/cors';
// import Validator from 'validatorjs';
import EventSubscriber from './v1/modules/common/event/services/event-subsriber';
import loggerPlugin from '@shared/utils/logger/plugin';
import { ErrorResponse } from '@shared/utils/response.util';
import Logger from '@shared/utils/logger';
import AppError from '@shared/error/app.error';
import { OnStartupService } from './v1/modules/github/services/OnStartupService';
import { IDatabase } from './v1/modules/github/Interfaces/IDatabase';
import { createDatabase, DatabaseType } from './v1/modules/github/factories/DatabaseFactory';
import config from '@config/config';
// import appConfig from './config/app.config';
import RouteVersion from '@config/route.config';
import appRoute from './v1/modules/app/app.route';
import healthRoute from './v1/modules/health/health.route';
import configRoute from './v1/modules/github/routes/config';
import repoRoute from './v1/modules/github/routes/repo';
import { ReposotoryController } from './v1/modules/github/controllers/repository';


class App {
  private fastify: FastifyInstance<Server, IncomingMessage, ServerResponse>;
  private database: IDatabase;

  constructor() {
    this.fastify = fastify({ logger: false, bodyLimit: 5 * 1024 * 1024 }); // body limit is 5MB
  }

  async initialize() {
    await this.bootstrapApp();
    this.registerModules();
  }

  private async bootstrapApp() {
    /*
    await this.initializeDatabase();
    this.registerDependencies();
    await this.subscribeToExternalEvents();
    await this.initializeGithubMonitor();
    this.registerThirdPartyModules();
    this.registerCustomValidationRules();
    this.setErrorHandler();
    */
    await this.initializeDatabase();
    this.registerDependencies();
    this.registerThirdPartyModules();
    this.setErrorHandler();
    await this.subscribeToExternalEvents();
    await this.initializeGithubMonitor();
    this.registerCustomValidationRules();
    //this.registerModules();
  }

  private async initializeDatabase() {
    this.database = createDatabase(config.databaseType as DatabaseType);
    await this.database.init();
    container.registerInstance<IDatabase>('database', this.database);;
  }

  private registerDependencies() {
    container.registerSingleton(EventSubscriber);
    container.registerSingleton(OnStartupService);
    container.registerSingleton(ReposotoryController);
  }

  private async subscribeToExternalEvents() {
    container.resolve(EventSubscriber).subscribeToTopics();
  }

  private async initializeGithubMonitor() {
    try {
      const onStartupService = container.resolve(OnStartupService);
      await onStartupService.updateConfig();
    } catch (error) {
      console.log('Failed to initialize Github monitor:', error);
    }
    await container.resolve(OnStartupService).updateConfig();
  }

  private registerThirdPartyModules() {
    this.fastify.register(cors, { origin: true });
    this.fastify.register(loggerPlugin);
  }

  private registerCustomValidationRules() {
    // Your existing custom validation rules...
  }

  private setErrorHandler() {
    this.fastify.setErrorHandler((err, request, reply) => {
      const statusCode = err.statusCode || 503;
      const message = err instanceof AppError ? err.message : 'We are unable to process your request. please try again';
      const errorCode = err instanceof AppError ? err.errorCode : undefined;

      Logger.error({ err: err.cause || err });

      return reply.status(statusCode).send(ErrorResponse(message, [], errorCode));
    });
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
    const eventSubscriber = container.resolve(EventSubscriber);
    await eventSubscriber.close();
  }

  public listen(port: number, address = '0.0.0.0') {
    return this.fastify.listen({ port, host: address });
  }
}

export default App;
