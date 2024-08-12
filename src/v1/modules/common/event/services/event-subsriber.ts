import { injectable } from 'tsyringe';
import { ServiceBusClient, ServiceBusReceiver, ServiceBusReceivedMessage } from '@azure/service-bus';
import EventResolver from './event-resolver';
import appConfig from '@config/app.config';
import logger from '@shared/utils/logger';

@injectable()
class EventSubscriber {
  private pubSubClient: ServiceBusClient;
  private subscriptions: ServiceBusReceiver[] = [];

  constructor(private readonly eventResolver: EventResolver) {
    this.pubSubClient = new ServiceBusClient(appConfig.azureService.pubSub.connectionString);
  }

  subscribeToTopics() {
    for (const topic of Object.keys(this.eventResolver.getEventMap())) {
      try {
        this.subscribeToTopic(topic);
      } catch (error) {
        logger.error({ error });
      }
    }
  }

  private subscribeToTopic(topic: string) {
    console.log(`Subsribing to topic ${topic}`);
    logger.info(`Subscribing to topic ${topic}`);

    const receiver: ServiceBusReceiver = this.pubSubClient.createReceiver(topic, topic);

    // console.log(receiver);

    const messageHandler = async (message: ServiceBusReceivedMessage) => {
      logger.info(
        `Event received: Topic (${topic}, id: ${message.correlationId}, Payload (${message.body.toString()}))`,
      );
      console.log(
        `Event received: Topic (${topic}, id: ${message.correlationId}, Payload (${message.body.toString()}))`,
      );
      try {
        // await this.eventResolver.processEvent(topic, message.body);
        // receiver.completeMessage(message);
        await this.processMessageWithRetry(topic, message, receiver);
      } catch (error) {
        logger.error({ error }, `Failed to process message ${message.messageId} after multiple retries`);
        await this.abandonMessageWithRetry(receiver, message);
      }
    };

    const errorHandler = async function (args) {
      logger.error(args.error, `Error occured wuth ${args.entityPath} within ${args.fullyQualifiedNamespace}`);
      console.log(args.error, `Error occured wuth ${args.entityPath} within ${args.fullyQualifiedNamespace}`);
    };

    receiver.subscribe({
      processMessage: messageHandler,
      processError: errorHandler,
    });

    this.subscriptions.push(receiver);
  }

  private async processMessageWithRetry(
    topic: string,
    message: ServiceBusReceivedMessage,
    receiver: ServiceBusReceiver,
    maxRetries = 3,
  ): Promise<void> {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await this.eventResolver.processEvent(topic, message.body);
        await this.completeMessageWithRetry(receiver, message);
        return;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        logger.warn(`Retrying message processing (attempt ${retries}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
  }

  private async completeMessageWithRetry(
    receiver: ServiceBusReceiver,
    message: ServiceBusReceivedMessage,
    maxRetries = 3,
  ): Promise<void> {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await receiver.completeMessage(message);
        return;
      } catch (error: any) {
        if (error.message.includes('deleted or already settled')) {
          logger.warn(`Message ${message.messageId} already settled, ignoring completion.`);
          return;
        }
        retries++;
        if (retries >= maxRetries) {
          logger.error(`Failed to complete message ${message.messageId} after ${maxRetries} attempts.`);
          throw error;
        }
        logger.warn(`Retrying message completion (attempt ${retries}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
  }

  private async abandonMessageWithRetry(
    receiver: ServiceBusReceiver,
    message: ServiceBusReceivedMessage,
    maxRetries = 3,
  ): Promise<void> {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await receiver.abandonMessage(message);
        return;
      } catch (error: any) {
        if (error.message.includes('deleted or already settled')) {
          logger.warn(`Message ${message.messageId} already settled, ignoring abandonment.`);
          return;
        }
        retries++;
        if (retries >= maxRetries) {
          logger.error(`Failed to abandon message ${message.messageId} after ${maxRetries} attempts.`);
          throw error;
        }
        logger.warn(`Retrying message abandonment (attempt ${retries}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
  }

  async close() {
    for (const subscription of this.subscriptions) {
      await subscription.close();
    }

    await this.pubSubClient.close();
  }
}

export default EventSubscriber;
