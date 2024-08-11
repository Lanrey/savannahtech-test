import { injectable } from 'tsyringe';
import TestTopicService from '../../../test/testing-pub-sub.service';
import ObjectLiteral from '@shared/types/object-literal.type';
import logger from '@shared/utils/logger';

@injectable()
class EventResolver {
  private eventMap = {
    // map topic name to handler processing the event //
    'test-asoro-template': this.testTopicService,
  };

  constructor(private readonly testTopicService: TestTopicService) {}

  async processEvent(topic: string, payload: ObjectLiteral) {
    console.log({ topic, payload }, 'Testing here');
    logger.info({ topic, payload }, 'Testing here');
    await this.eventMap[topic].execute(payload);
  }

  getEventMap() {
    return this.eventMap;
  }
}
export default EventResolver;
