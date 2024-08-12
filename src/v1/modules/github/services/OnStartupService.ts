import { injectable, container } from 'tsyringe';
import { createDatabase, DatabaseType } from '../factories/DatabaseFactory';
import { RepositoryMonitor } from './RepositoryMonitor';
import config from '@config/config';
import { IDatabase } from '../Interfaces/IDatabase';
import PublishEvent from '../../common/event/services/publish-event-service';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class OnStartupService {
  private repoMonitor: RepositoryMonitor;
  private publishEvent: PublishEvent;
  constructor() {
    this.publishEvent = container.resolve(PublishEvent);
  }

  async updateConfig() {
    const database: IDatabase = createDatabase(config.databaseType as DatabaseType);
    await database.init();

    container.registerInstance('database', database);

    this.repoMonitor = container.resolve(RepositoryMonitor);

    if (this.repoMonitor) {
      this.repoMonitor.stopMonitoring();
    }

    await this.publishEvent.execute({
      eventId: uuidv4(),
      type: 'test-asoro-template',
      payload: config,
      saveIfPublishFailed: true,
    });

    /*

  

    */
  }
}
