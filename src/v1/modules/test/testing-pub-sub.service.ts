import logger from '@shared/utils/logger';
class TestTopicService {
  execute(dataFromPublisher: any) {
    logger.info('Sending message to APP Insights');

    console.log(dataFromPublisher);
    return {
      service: '9jaPay base template',
      version: '1.0.0',
    };
  }
}

export default TestTopicService;
