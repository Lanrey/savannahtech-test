import { AxiosError } from 'axios';
import logger from '@shared/utils/logger';

/**
 * Service error is a wrapper around axios error for HTTP requests
 */
export const handleServiceError = (err: unknown, message: string) => {
  const error = err as AxiosError;

  if (error.response) {
    const cause = {
      code: error.response.status,
      details: error.response.data,
    };

    logger.error({ err: cause }, message);
  }
};
