import { FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'tsyringe';
import httpStatus from 'http-status';
import { getDB } from '../../../database';

@injectable()
class HealthService {
  constructor() {}

  async readinessCheck(req: FastifyRequest, reply: FastifyReply) {
    const postgresHealth = await this.checkPostgresHealth();

    if (postgresHealth.status === 'UP') {
      reply.code(httpStatus.OK).send({
        status: 'UP',
        checks: [postgresHealth],
      });
    } else {
      reply.code(httpStatus.SERVICE_UNAVAILABLE).send({
        status: 'DOWN',
        checks: [postgresHealth],
      });
    }
  }

  livelinessCheck(req: FastifyRequest, reply: FastifyReply) {
    reply.code(httpStatus.OK).send({
      status: 'UP',
    });
  }

  private async checkPostgresHealth() {
    const name = 'postgres';
    let status = 'UP';
    let reason;

    try {
      const res = await getDB().raw('SELECT 1 + 1 as result');

      if (res.rows[0].result !== 2) {
        status = 'DOWN';
      }
    } catch (err: any) {
      status = 'DOWN';
      reason = err.message;
    }

    return {
      name,
      status,
      reason,
    };
  }
}

export default HealthService;
