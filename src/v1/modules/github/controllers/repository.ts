import { injectable } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SuccessResponse } from '@shared/utils/response.util';
import { createDatabase, DatabaseType } from '../factories/database.factory';
import config from '@config/config';

@injectable()
export class ReposotoryController {
  constructor() {}

  async getTopCommitAuthors(req: FastifyRequest<{ Querystring: { count: string } }>, res: FastifyReply) {
    const count = parseInt(req.query.count, 10);
    if (isNaN(count) || count <= 0) {
      res.status(400).send({ error: 'Invalid count parameter' });
    }

    const database = createDatabase(config.databaseType as DatabaseType);

    const authors = await database.getTopCommitAuthors(count);

    res.send(SuccessResponse(`Top ${count} authors retrieved successfully`, authors));
  }

  async getCommitsByRepository(
    req: FastifyRequest<{ Querystring: { limit?: string; repositoryName: string } }>,
    res: FastifyReply,
  ) {
    const { repositoryName } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
      res.status(400).send({ error: 'Invalid limit parameter' });
      return;
    }

    const database = createDatabase(config.databaseType as DatabaseType);

    const commits = await database.getCommitsByRepository(repositoryName, limit);

    res.send(SuccessResponse('Commits for Repository Retrieved Successfully', commits));
  }
}
