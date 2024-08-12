import { FastifyPluginAsync } from 'fastify';
import { container } from 'tsyringe';
import ConfigController from '../controllers/config';
import validate from '@shared/middlewares/validator.middleware';
import { configRules } from '../validations/config.validation';

const configController = container.resolve(ConfigController);

const configRoute: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'POST',
    url: '/setup/new-repo',
    preValidation: [validate(configRules)],
    handler: configController.dynamicConfig,
  });
};

export default configRoute;
