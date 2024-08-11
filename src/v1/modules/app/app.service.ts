import logger from '@shared/utils/logger';
import PublishEvent from '../common/event/services/publish-event-service';
import { v4 as uuidv4 } from 'uuid';
import { injectable } from 'tsyringe';

@injectable()
class AppService {
  constructor(private readonly publishEvent: PublishEvent) {}

  async getHello() {
    logger.info('Sending message to APP Insights');

    await this.publishEvent.execute({
      eventId: uuidv4(),
      type: 'test-asoro-template',
      payload: {
        message: 'Testing for chisels',
      },
    });
    return {
      service: '9jaPay base template',
      version: '1.0.0',
    };
  }
}

export default AppService;
