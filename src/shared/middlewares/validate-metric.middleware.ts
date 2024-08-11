import { FastifyReply } from 'fastify';
import Validator from 'validatorjs';
import httpStatus from 'http-status';
import { ErrorResponse } from '../utils/response.util';
import { createValidationError } from '@shared/utils/validation.util';

const rules = {
  metric: ['required', { in: ['daily', 'monthly', 'active'] }],
};

const validationMessages = {
  'metric.in': 'metric type is not supported',
};

const validateMetricParam = (request: any, reply: FastifyReply, done) => {
  const validation = new Validator(request.params, rules, validationMessages);

  const errors = validation.errors.all();

  if (validation.fails()) {
    return reply.code(httpStatus.BAD_REQUEST).send(ErrorResponse('metric is invalid', createValidationError(errors)));
  }

  done();
};

export default validateMetricParam;
