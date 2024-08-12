import { injectable } from 'tsyringe';
import { DatabaseFactory, DatabaseType } from '../factories/DatabaseFactory';
import { RepositoryMonitor } from './RepositoryMonitor';
import config from '@config/config';

@injectable()
export class OnStartupService {
  constructor(private readonly repoMonitor: RepositoryMonitor) {}

  async updateConfig() {
    const database = DatabaseFactory.createDatabase(config.databaseType as DatabaseType);
    await database.init();

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
