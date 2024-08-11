import { injectable } from 'tsyringe';
import PublishEvent from './publish-event-service';
import OutboxRepo from '../repositories/outbox.repo';
import { Outbox } from '../models/outbox.model';

@injectable()
class RepublishFailedEvents {
  constructor(
    private readonly publishEvent: PublishEvent,
    private readonly outboxRepo: OutboxRepo,
  ) {}

  async execute() {
    const events = await this.outboxRepo.getAll();

    Promise.all(
      events.map(async (event) => {
        await this.publish(event);
      }),
    );
  }

  async publish({ id, eventId, type, payload }: Outbox) {
    try {
      await this.publishEvent.execute({ eventId, type, payload, saveIfPublishFailed: false });

      await this.outboxRepo.deleteById(id);
    } catch (error) {}
  }
}

export default RepublishFailedEvents;
