import { injectable, container } from 'tsyringe';
import { createDatabase, DatabaseType } from '../factories/DatabaseFactory';
import { RepositoryMonitor } from './RepositoryMonitor';
import config from '@config/config';
import { IDatabase } from '../Interfaces/IDatabase';

@injectable()
export class OnStartupService {
  private repoMonitor: RepositoryMonitor;
  constructor() {}

  async updateConfig() {
    const database: IDatabase = createDatabase(config.databaseType as DatabaseType);
    await database.init();

    container.registerInstance('database', database);

    this.repoMonitor = container.resolve(RepositoryMonitor);

    if (this.repoMonitor) {
      this.repoMonitor.stopMonitoring();
    }

    await this.repoMonitor.initializeAndMonitor(
      config.defaultOwner,
      config.defaultRepo,
      config.cronSchedule,
      config.startDate,
    );
  }
}
