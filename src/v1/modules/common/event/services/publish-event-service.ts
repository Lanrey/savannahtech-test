import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus';
import { injectable } from 'tsyringe';
import { Event } from '../types/event.type';
import logger from '@shared/utils/logger';
import appConfig from '@config/app.config';

@injectable()
class PublishEvent {
  private pubSubClient: ServiceBusClient;

  constructor() {
    // Initialize the ServiceBusClient with the connection string
    this.pubSubClient = new ServiceBusClient(appConfig.azureService.pubSub.connectionString);
  }

  async execute(event: Event) {
    try {
      await this.publishEvent(event);
    } catch (error) {
      logger.error({ error }, 'Unable to publish event to pubsub');
      throw error;
    }
  }

  private async publishEvent({ eventId, type, payload }: Event) {
    logger.info({ eventId, type, payload }, 'Publishing event to pubsub');
    console.log({ eventId, type, payload }, 'Publishing event to pubsub');

    try {
      const sender = this.pubSubClient.createSender(type);

      // Create the message to send
      const message: ServiceBusMessage = {
        body: payload,
        contentType: 'application/json',
        correlationId: eventId,
      };

      // Send the message
      await sender.sendMessages(message);
      logger.info(`Event Published to ${type} with id ${eventId}`);
    } catch (error) {
      logger.error({ error }, 'Unable to publish event to pubsub');
      throw error;
    }
  }
}

export default PublishEvent;
