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
        
        await this.eventResolver.processEvent(topic, message.body);
        receiver.completeMessage(message);
    
      } catch (error) {
        logger.error(`Event processing event: ${error}`);
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
}

export default EventSubscriber;
