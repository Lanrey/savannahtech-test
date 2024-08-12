import { injectable, container } from 'tsyringe';
import { createDatabase, DatabaseType } from '../factories/database.factory';
import { RepositoryMonitor } from './repository-monitor.service';
import config from '@config/config';
import { IDatabase } from '../Interfaces/IDatabase';
import PublishEvent from '../../common/event/services/publish-event-service';
import { v4 as uuidv4 } from 'uuid';
import logger from '@shared/utils/logger';

@injectable()
export class OnStartupService {
  private repoMonitor: RepositoryMonitor;
  private publishEvent: PublishEvent;
  private isInitialized: boolean = false;
  constructor() {
    this.publishEvent = container.resolve(PublishEvent);
  }

  async updateConfig() {
    if (this.isInitialized) {
      logger.info('Github monitor already initialized. Skipping');
      return;
    }
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

    this.isInitialized = true;

    logger.info('Github monitor initialized successfully');
  }
}
