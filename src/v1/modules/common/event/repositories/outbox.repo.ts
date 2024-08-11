import { Transaction } from 'objection';
import { IOutbox, Outbox } from '../models/outbox.model';
import { Event } from '../types/event.type';

class OutboxRepo {
  async save({ eventId, type, payload }: Event, transaction?: Transaction): Promise<IOutbox> {
    const outbox = await Outbox.query(transaction).insert({ eventId, type, payload }).returning('*');

    return outbox;
  }

  async getAll() {
    return await Outbox.query();
  }

  async deleteById(id: string) {
    return await Outbox.query().deleteById(id);
  }
}

export default OutboxRepo;
