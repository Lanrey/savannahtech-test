import { FastifyPluginAsync } from 'fastify';
import { container } from 'tsyringe';
import { ReposotoryController } from '../controllers/repository';

const repoController = container.resolve(ReposotoryController);

const repoRoute: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/github-monitor/top-authors/:count',
    handler: repoController.getTopCommitAuthors,
  });

  fastify.route({
    method: 'GET',
    url: '/github-monitor/commits/:repositoryName',
    handler: repoController.getCommitsByRepository,
  });
};

export default repoRoute;
