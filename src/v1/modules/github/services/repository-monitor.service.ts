import { GithubApiService } from './github-api.service';
import { IDatabase } from '../Interfaces/IDatabase';
import cron from 'node-cron';
import { repositoryEvents, CommitEvent, RepositoryUpdateEvent } from '../events/repository.event';
import { injectable, inject } from 'tsyringe';
import logger from '@shared/utils/logger';
import DatabaseError from '@shared/error/database.error';

@injectable()
export class RepositoryMonitor {
  private cronJob: cron.ScheduleTask | null = null;

  constructor(
    @inject(GithubApiService) private readonly githubApiService: GithubApiService,
    @inject('database') private readonly database: IDatabase,
  ) {}

  async monitorRepository(owner: string, repo: string, cronExpression: string, startDate?: string): Promise<void> {
    if (this.cronJob) {
      this.cronJob.stop();
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      try {
        await this.updateRepository(owner, repo, startDate);
      } catch (error: any) {
        console.error(`Error updating repository ${owner}/${repo}:`, error);
        throw new Error(`${error.message}`);
      }
    });

    console.log(`Started monitoring repository ${owner}/${repo} with schedule: ${cronExpression}`);
    logger.info(`Started monitoring repository ${owner}/${repo} with schedule: ${cronExpression}`);
  }

  private async updateRepository(owner: string, repo: string, startDate?: string): Promise<void> {
    try {
      const repoInfo = await this.githubApiService.getRepositoryInfo(owner, repo);
      const repositoryId = await this.database.saveRepository(repoInfo);

      let since = startDate;
      if (!since) {
        const latestCommit = await this.database.getLatestCommit(repositoryId);
        since = latestCommit ? latestCommit.date : undefined;
      }

      const commits = await this.githubApiService.getCommits(owner, repo, since);
      for (const commit of commits) {
        const commitExists = await this.database.commitExists(repositoryId, commit.sha);
        if (!commitExists) {
          await this.database.saveCommit(repositoryId, commit);

          const commitEvent: CommitEvent = { repositoryId, commit };

          repositoryEvents.emitNewCommit(commitEvent);
        }
      }

      const updateEvent: RepositoryUpdateEvent = { owner, repo, updatedAt: new Date() };
      repositoryEvents.emitRepositoryUpdated(updateEvent);

      console.log(`Updated repository ${owner}/${repo} at ${new Date().toISOString()}`);
      logger.info(`Updated repository ${owner}/${repo} at ${new Date().toISOString()}`);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new Error('Database Error while Saving in the database');
      } else {
        throw new Error('Error Connecting to Github');
      }
    }
  }

  async resetCollectionSince(owner: string, repo: string, date: string): Promise<void> {
    try {
      const repoInfo = await this.githubApiService.getRepositoryInfo(owner, repo);
      const repositoryId = await this.database.saveRepository(repoInfo);

      await this.database.deleteCommitsSince(repositoryId, date);

      console.log(`Reset Collection for ${owner}/${repo} since ${date}`);
      logger.info(`Reset Collection for ${owner}/${repo} since ${date}`);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new Error('Database Error while Saving in the database');
      } else {
        throw new Error('Error Connecting to Github');
      }
    }
  }

  async seedDatabase(owner: string, repo: string, startDate?: string): Promise<void> {
    try {
      logger.info(`Seeding database with initial data for ${owner}/${repo}`);
      console.log(`Seeding database with initial data for ${owner}/${repo}`);

      const repoInfo = await this.githubApiService.getRepositoryInfo(owner, repo);
      const repositoryId = await this.database.saveRepository(repoInfo);

      const commits = await this.githubApiService.getCommits(owner, repo, startDate);

      await this.database.saveCommit(repositoryId, commits);

      /*

      for (const commit of commits) {
        const commitExists = await this.database.commitExists(repositoryId, commit.sha);
        if (!commitExists) {
          await this.database.saveCommit(repositoryId, commit);

          const commitEvent: CommitEvent = { repositoryId, commit };
          repositoryEvents.emitNewCommit(commitEvent);
        }
      }
    */

      const updateEvent: RepositoryUpdateEvent = { owner, repo, updatedAt: new Date() };
      repositoryEvents.emitRepositoryUpdated(updateEvent);

      console.log(`Finished seeding database for ${owner}/${repo}`);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new Error('Database Error while Saving in the database');
      } else {
        throw new Error('Error Connecting to Github');
      }
    }
  }

  async initializeAndMonitor(owner: string, repo: string, cronExpression: string, startDate?: string): Promise<void> {
    await this.seedDatabase(owner, repo, startDate);
    await this.monitorRepository(owner, repo, cronExpression, startDate);
  }

  stopMonitoring(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Stopped monitoring repository');
      logger.info('Stopped monitoring repository');
    }
  }
}
