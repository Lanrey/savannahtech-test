import Knex from 'knex';
import { Knex as IKnex } from 'knex/types';
import { Model } from 'objection';
import { IDatabase } from '../Interfaces/IDatabase';
import { Repository } from '../models/Repository';
import { Commit } from '../models/Commit';
import config from '../../../../config/config';
import logger from '../../../../shared/utils/logger';
import DatabaseError from '@shared/error/database.error';
import { injectable } from 'tsyringe';
import { CacheService } from './CacheService';

@injectable()
export class PostgresqlDatabase implements IDatabase {
  private knex: IKnex;
  private cacheService: CacheService;

  constructor() {
    this.knex = Knex(config.database);
    Model.knex(this.knex);
  }

  async init(): Promise<void> {
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    const hasRepositoryTable = await this.knex.schema.hasTable('repositories');
    if (!hasRepositoryTable) {
      await this.knex.schema.createTable('repositories', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description');
        table.string('url').notNullable();
        table.string('language');
        table.integer('forks_count').notNullable();
        table.integer('stars_count').notNullable();
        table.integer('open_issues_count').notNullable();
        table.integer('watchers_count').notNullable();
        table.timestamps(true, true);

        // Add indexes
        table.index('name');
        table.index('language');
        table.index('stars_count');
        table.index('forks_count');
      });
    }

    const hasCommitTable = await this.knex.schema.hasTable('commits');
    if (!hasCommitTable) {
      await this.knex.schema.createTable('commits', (table) => {
        table.increments('id').primary();
        table.integer('repository_id').references('id').inTable('repositories').onDelete('CASCADE');
        table.string('sha').unique().notNullable();
        table.text('message').notNullable();
        table.string('author').notNullable();
        table.dateTime('date').notNullable();
        table.string('url').notNullable();
        table.timestamps(true, true);

        table.index('repository_id');
        table.index('sha');
        table.index('author');
        table.index('date');
      });
    }
  }

  async saveRepository(repo: any): Promise<number> {
    try {
      const result = await Repository.query().insert({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        forks_count: repo.forks_count,
        stars_count: repo.stargazers_count,
        open_issues_count: repo.open_issues_count,
        watchers_count: repo.watchers_count,
      });
      await this.cacheService.clearRepositoryCache(repo.owner.login, repo.name);
      return result.id;
    } catch (error) {
      logger.error(error, 'Database Service - Create Repostory Failed');
      throw new DatabaseError('Database Service - Create Repo Failed');
    }
  }

  async saveCommit(repositoryId: number, commit: any): Promise<void> {
    try {
      await Commit.query().insert({
        repository_id: repositoryId,
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      });
      const repository = await Repository.query().findById(repositoryId);
      if (repository) {
        await this.cacheService.clearRepositoryCache(repository.name.split('/')[0], repository.name.split('/')[1]);
      }
    } catch (error) {
      logger.error(error, 'Database Service - Save Commit Failed');
      throw new DatabaseError('Database Service - Save Commit Failed');
    }
  }

  async getTopCommitAuthors(n: number): Promise<any[]> {
    try {
      const cacheKey = `topAuthors:${n}`;
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) return cachedResult;
      const result = await Commit.query()
        .select('author')
        .count('* as commit_count')
        .groupBy('author')
        .orderBy('commit_count', 'desc')
        .limit(n);

      await this.cacheService.set(cacheKey, result, 3600);
      return result;
    } catch (error) {
      logger.error(error, 'Database Service - Getting Top Commit Authors Failed');
      throw new DatabaseError('Database Service - Getting Top Commit Authors Failed');
    }
  }

  async getCommitsByRepository(repositoryName: string, limit?: number): Promise<any[]> {
    try {
      const cacheKey = `commits:${repositoryName}:${limit || 'all'}`;
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) return cachedResult;
      const query = Commit.query()
        .join('repositories', 'commits.repository_id', 'repositories.id')
        .where('repositories.name', repositoryName)
        .orderBy('commits.date', 'desc');

      if (limit) {
        query.limit(limit);
      }

      const result = await query;

      await this.cacheService.set(cacheKey, result, 3600);
      return result;
    } catch (error) {
      logger.error(error, 'Database Service - Getting Top Commit Authors Failed');
      throw new DatabaseError('Database Service - Getting Top Commit Authors Failed');
    }
  }

  async getLatestCommit(repositoryId: number): Promise<any> {
    try {
      return Commit.query().where('repository_id', repositoryId).orderBy('date', 'desc').first();
    } catch (error) {
      logger.error(error, 'Database Service - Getting Latest Commit Failed');
      throw new DatabaseError('Database Service - Getting Latest Commit Failed');
    }
  }

  async getEarliestCommit(repositoryId: number): Promise<any> {
    try {
      return Commit.query().where('repository_id', repositoryId).orderBy('date', 'asc').first();
    } catch (error) {
      logger.error(error, 'Database Service - Getting Earliest Commit Failed');
      throw new DatabaseError('Database Service - Getting Earliest Commit Failed');
    }
  }

  async deleteCommitsSince(repositoryId: number, date: string): Promise<void> {
    try {
      await Commit.query().where('repository_id', repositoryId).where('date', '>=', date).delete();

      const repository = await Repository.query().findById(repositoryId);
      if (repository) {
        await this.cacheService.clearRepositoryCache(repository.name.split('/')[0], repository.name.split('/')[1]);
      }
    } catch (error) {
      logger.error(error, 'Database Service - Delete Commit Since Failed');
      throw new DatabaseError('Database Service - Delete Commit Since Failed');
    }
  }

  async commitExists(repositoryId: number, sha: string): Promise<boolean> {
    try {
      const count = await Commit.query().where('repository_id', repositoryId).where('sha', sha).resultSize();
      return count > 0;
    } catch (error) {
      logger.error(error, 'Database Service - Check Commit Exists Failed');
      throw new DatabaseError('Database Service - Check Commit Exists Failed');
    }
  }
}
