import cors from '@fastify/cors';
import { container } from 'tsyringe';
import Validator from 'validatorjs';
//import EventSubscriber from './v1/modules/event/services/event-subscriber';
import EventSubscriber from './v1/modules/common/event/services/event-subsriber';
//import RetryAccountCreationService from './v1/modules/account/services/retry-account-creation.service';
import initializeDatabase from './database';
import loggerPlugin from '@shared/utils/logger/plugin';
import { ErrorResponse } from '@shared/utils/response.util';
import Logger from '@shared/utils/logger';
import AppError from '@shared/error/app.error';

// register event subscribers
/*
import './v1/modules/common/messaging/services/messaging.service';
import './v1/modules/common/firebase/events/firebase-event.subscriber';
import './v1/modules/onboarding/services/send-user-welcome-email.service';
import './v1/modules/user/services/delete-profile-picture.service';
import { UserTierUpgradeTierJobProcessor } from './v1/modules/customer/services/handle-user-tier-upgrade-job.service';

*/

function bootstrapApp(fastify) {
  initializeDatabase();

  registerThirdPartyModules(fastify);

  registerCustomValidationRules();

  initializeTasks();

  initializeJobProccessor();

  subscribeToExternalEvents();

  setErrorHandler(fastify);
}

function registerThirdPartyModules(fastify) {
  fastify.register(cors, { origin: true });

  fastify.register(loggerPlugin);
}

function registerCustomValidationRules() {
  // initialize custom validations for validatorjs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  Validator.register(
    'name',
    (value) => {
      return /^[a-zA-Z-]{2,100}$/.test(value);
    },
    'The :attribute field is not valid',
  );

  Validator.register(
    'username',
    (value) => {
      return /^[a-zA-Z-][a-zA-Z0-9_-]{1,20}$/.test(value);
    },
    'The :attribute field is not valid',
  );

  Validator.register(
    'uuid',
    (value) => {
      return uuidRegex.test(value);
    },
    ':attribute is not a valid UUID',
  );

  // this is a case sensitive implementation of validatorjs "in" operator
  Validator.register('isIn', (value, requirement: string) => {
    return (
      requirement.split(',').findIndex((element) => {
        return element.toLowerCase() === value.toLowerCase();
      }) !== -1
    );
  });
}

function initializeTasks() {
  //container.resolve(RetryAccountCreationService).registerSchedule();
}

function initializeJobProccessor() {
 // container.resolve(UserTierUpgradeTierJobProcessor).initializeProccessor();
}

function subscribeToExternalEvents() {
  container.resolve(EventSubscriber).subscribeToTopics();
}

function setErrorHandler(fastify) {
  fastify.setErrorHandler((err, request, reply) => {
    const statusCode = err.statusCode || 503;
    const message = err instanceof AppError ? err.message : 'We are unable to process your request. please try again';
    const errorCode = err instanceof AppError ? err.errorCode : undefined;

    Logger.error({ err: err.cause || err });

    return reply.status(statusCode).send(ErrorResponse(message, [], errorCode));
  });
}

export default bootstrapApp;
