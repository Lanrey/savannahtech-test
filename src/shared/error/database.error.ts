export default class DatabaseError extends Error {
  constructor(message) {
    super(message);

    this.name = 'DatabaseError';

    Error.captureStackTrace(this, this.constructor);
  }
}
