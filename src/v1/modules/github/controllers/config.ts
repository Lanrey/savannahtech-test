import { injectable } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SuccessResponse } from '@shared/utils/response.util';
import { DatabaseFactory, DatabaseType } from '../factories/DatabaseFactory';
import { RepositoryMonitor } from '../services/RepositoryMonitor';
import { setupRepositoryEventHandlers } from '../events/repositoryEventHandlers';
import config from '../../../../config/config';
import ConfigDto from '../dtos/config.dto';

@injectable()
class ConfigController {
  constructor(private readonly repoMonitor: RepositoryMonitor) {}

  dynamicConfig = async (req: FastifyRequest<{ Body: ConfigDto }>, res: FastifyReply) => {
    const { defaultOwner, defaultRepo, databaseType, cronSchedule, startDate } = req.body;

    // update config //
    config.defaultOwner = defaultOwner || config.defaultOwner;
    config.defaultRepo = defaultRepo || config.defaultRepo;
    config.databaseType = databaseType || config.databaseType;
    config.cronSchedule = cronSchedule || config.cronSchedule;
    config.startDate = startDate || config.startDate;

    const database = DatabaseFactory.createDatabase(config.databaseType as DatabaseType);
    await database.init();

    setupRepositoryEventHandlers();

    if (this.repoMonitor) {
      this.repoMonitor.stopMonitoring();
    }

    await this.repoMonitor.initializeAndMonitor(
      config.defaultOwner,
      config.defaultRepo,
      config.cronSchedule,
      config.startDate,
    );

    res.send(SuccessResponse('Configuration updated successfully, You can now query the services and database'));
  };
}

export default ConfigController;
