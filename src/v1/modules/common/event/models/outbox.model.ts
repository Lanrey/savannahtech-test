import { Model, ModelObject } from 'objection';
import ObjectLiteral from '@shared/types/object-literal.type';

export class Outbox extends Model {
  static tableName = 'outbox';

  id: string;

  eventId: string;

  type: string;

  payload: ObjectLiteral;
}

export type IOutbox = ModelObject<Outbox>;
