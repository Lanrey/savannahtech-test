import { FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'tsyringe';
import AppService from './app.service';

@injectable()
class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly publishEvent: PublishEvent,
  ) {}

  getHello = async (req: FastifyRequest, res: FastifyReply) => {
    res.send(await this.appService.getHello());
  };
}

export default AppController;
