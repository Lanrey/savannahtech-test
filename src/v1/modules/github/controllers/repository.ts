import { injectable } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SuccessResponse } from '@shared/utils/response.util';
import { PostgresqlDatabase } from '../services/PostgresqlDatabase';

@injectable()
export class ReposotoryController {
  constructor(private readonly postgresqlDatabase: PostgresqlDatabase) {}

  async getTopCommitAuthors(req: FastifyRequest<{ Params: { count: string } }>, res: FastifyReply) {
    const count = parseInt(req.params.count, 10);
    if (isNaN(count) || count <= 0) {
      res.status(400).send({ error: 'Invalid count parameter' });
    }

    const authors = await this.postgresqlDatabase.getTopCommitAuthors(count);

    res.send(SuccessResponse(`Top ${count} authors retrieved successufully`, authors));
  }

  async getCommitsByRepository(
    req: FastifyRequest<{ Params: { repositoryName: string }; Querystring: { limit?: string } }>,
    res: FastifyReply,
  ) {
    const { repositoryName } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
      res.status(400).send({ error: 'Invalid limit parameter' });
      return;
    }

    const commits = await this.postgresqlDatabase.getCommitsByRepository(repositoryName, limit);

    res.send(SuccessResponse('Commits for Repository Retrieved Sucessfully', commits));
  }
}
