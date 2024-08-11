import ObjectLiteral from '@shared/types/object-literal.type';

export type Event = {
  eventId: string;
  type: string;
  payload: ObjectLiteral;
  saveIfPublishFailed?: boolean;
};


