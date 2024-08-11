import pino from 'pino';
import * as appInsights from 'applicationinsights';
import appConfig from '../../../config/app.config';
import compose from '@0dep/pino-applicationinsights';

appInsights.setup(appConfig.azureService.logs.connectionString).start();

const transport = compose({
  track(chunk) {
    const { time, severity, msg: message, properties, exception } = chunk;
    this.trackTrace({ time, severity, message, properties });
    if (exception) this.trackException({ time, exception, severity });
  },
  connectionString: appConfig.azureService.logs.connectionString,
  config: { maxBatchSize: 1 },
});

const logger = pino(
  {
    enabled: appConfig.app.env !== 'test',
    mixin() {
      return {
        service: appConfig.app.name,
      };
    },
    serializers: {
      req(req) {
        return {
          method: req.method,
          headers: req.headers,
          ip: req.ip,
          url: req.url,
          path: req.path,
          params: req.params,
          query: req.query,
          body: req.body,
        };
      },
      res(res) {
        return {
          statusCode: res.raw.statusCode,
          headers: res.getHeaders(),
          body: res.raw.payload,
        };
      },
      err(err) {
        return {
          id: err.id,
          type: err.type,
          code: err.code,
          message: err.message,
          stack: err.stack,
          details: err.details,
        };
      },
    },
    redact: [
      'req.headers.authorization',
      'res.body.data.banks',
      'req.body.picture',
      'req.body.pin',
      'req.body.confirmPin',
      'req.body.passcode',
    ],
  },
  transport,
);

export default logger;
