import logger from '@shared/utils/logger';
import { injectable } from 'tsyringe';
import { RepositoryMonitor } from '../github/services/RepositoryMonitor';
@injectable()
class SeedTopicService {
  constructor(private readonly repoMonitor: RepositoryMonitor) {}
  async execute(config: any) {
    logger.info('Getting values from publisher', config);

    await this.repoMonitor.initializeAndMonitor(
      config.defaultOwner,
      config.defaultRepo,
      config.cronSchedule,
      config.startDate,
    );

    return 'done';
  }
}

export default SeedTopicService;
