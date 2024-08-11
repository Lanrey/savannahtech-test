

import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { container } from 'tsyringe';
import bootstrapApp from './bootstrap';
//import RouteVersion from '@config/route.config';
import appRoute from './v1/modules/app/app.route';
import healthRoute from './v1/modules/health/health.route';
//import onboardingRoute from './v1/modules/onboarding/onboarding.route';
//import userRoute from './v1/modules/user/routes/user.route';
//import authRoute from './v1/modules/auth/routes/auth.route';
//import pinRoute from './v1/modules/auth/routes/pin.route';
//import passcodeRoute from './v1/modules/auth/routes/passcode.route';
//import deviceRoute from './v1/modules/device/device.route';
//import metamapRoute from './v1/modules/metamap/routes/metamap.route';
//import accountRoute from './v1/modules/account/account.route';
//import nextOfKinRoute from './v1/modules/user/routes/next-of-kin.route';
import { RedisClient } from '@shared/redis-client/redis-client';
//import adminRoute from './v1/modules/admin/routes/user.route';
//import { UserTierUpgradeTierJobProcessor } from './v1/modules/customer/services/handle-user-tier-upgrade-job.service';


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
    /*
    this.fastify.register(onboardingRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(userRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(authRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(pinRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(passcodeRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(deviceRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(metamapRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(accountRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(nextOfKinRoute, { prefix: RouteVersion.v1 });
    this.fastify.register(adminRoute, { prefix: RouteVersion.v1 });
    */
  }

  public getInstance() {
    return this.fastify;
  }

  public async close() {
   // container.resolve(UserTierUpgradeTierJobProcessor).terminateProccessor();
    await this.fastify.close();

   await container.resolve(RedisClient).close();
  }

  public listen(port: number, address = '0.0.0.0') {
    return this.fastify.listen(port, address);
  }
}

export default App;
