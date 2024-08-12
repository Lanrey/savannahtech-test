import { FastifyPluginAsync } from 'fastify';
import { container } from 'tsyringe';
import { ReposotoryController } from '../controllers/repository';

const reposController = container.resolve(ReposotoryController);
const repoRoute: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/github-monitor/top-authors',
    handler: reposController.getTopCommitAuthors,
  });

  fastify.route({
    method: 'GET',
    url: '/github-monitor/commits',
    handler: reposController.getCommitsByRepository,
  });
};

export default repoRoute;
