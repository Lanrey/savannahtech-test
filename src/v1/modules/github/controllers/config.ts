import { injectable, container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SuccessResponse } from '@shared/utils/response.util';
import { createDatabase, DatabaseType } from '../factories/DatabaseFactory';
import { RepositoryMonitor } from '../services/RepositoryMonitor';
import { setupRepositoryEventHandlers } from '../events/repositoryEventHandlers';
import config from '../../../../config/config';
import ConfigDto from '../dtos/config.dto';
import PublishEvent from '../../common/event/services/publish-event-service';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class ConfigController {
  private repoMonitor: RepositoryMonitor;
  private publishEvent: PublishEvent;

  constructor() {
    this.publishEvent = container.resolve(PublishEvent);
  }

  dynamicConfig = async (req: FastifyRequest<{ Body: ConfigDto }>, res: FastifyReply) => {
    try {
      const { defaultOwner, defaultRepo, databaseType, cronSchedule, startDate } = req.body;

      // Update config with provided values or fallback to existing values
      config.defaultOwner = defaultOwner || config.defaultOwner;
      config.defaultRepo = defaultRepo || config.defaultRepo;
      config.databaseType = databaseType || config.databaseType;
      config.cronSchedule = cronSchedule || config.cronSchedule;
      config.startDate = startDate || config.startDate;

      // Create and initialize the database
      const database = createDatabase(config.databaseType as DatabaseType);
      await database.init();

      container.registerInstance('database', database);

      // Setup repository event handlers
      setupRepositoryEventHandlers();

      // Stop the current monitoring, if active
      if (this.repoMonitor) {
        this.repoMonitor.stopMonitoring();
      }

      this.repoMonitor = container.resolve(RepositoryMonitor);

      await this.publishEvent.execute({
        eventId: uuidv4(),
        type: 'test-asoro-template',
        payload: config,
        saveIfPublishFailed: true,
      });

      /*

      // Initialize and start monitoring the repository
      await this.repoMonitor.initializeAndMonitor(
        config.defaultOwner,
        config.defaultRepo,
        config.cronSchedule,
        config.startDate,
      );

      */

      res.send(SuccessResponse('Configuration updated successfully, You can now query the services and database'));
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while updating the configuration' });
    }
  };
}
