import { FastifyReply, FastifyRequest } from 'fastify';
import Validator from 'validatorjs';
import { ErrorResponse } from '../utils/response.util';
import ObjectLiteral from '../types/object-literal.type';
import { createValidationError } from '@shared/utils/validation.util';

const validate = (rules: ObjectLiteral, validationMessages?: ObjectLiteral) => {
  return (request: FastifyRequest, reply: FastifyReply, done) => {
    const validation = new Validator(request.body, rules, validationMessages);

    const errors = validation.errors.all();

    if (validation.fails()) {
      const validationErrors = createValidationError(errors);
      const firstErrorObject = validationErrors[0];
      const firstErrorField = firstErrorObject?.field;
      const firstErrorMessage = firstErrorObject?.message;
      const fields = firstErrorField.split('.');

      const message = fields[2] ? firstErrorMessage.replace(firstErrorField, fields[2]) : firstErrorMessage;

      return reply.code(400).send(ErrorResponse(message, validationErrors));
    }

    done();
  };
};

export default validate;
