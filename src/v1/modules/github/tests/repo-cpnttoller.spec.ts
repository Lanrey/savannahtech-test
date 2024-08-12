import 'reflect-metadata';
import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ReposotoryController } from '../controllers/repository'; // Update path as necessary
import { PostgresqlDatabase } from '../services/PostgresqlDatabase';
import { SuccessResponse } from '../../../../shared/utils/response.util';

// Mock dependencies
jest.mock('../services/PostgresqlDatabase');

describe('RepositoryController', () => {
  let repositoryController: ReposotoryController;
  let mockPostgresqlDatabase: jest.Mocked<PostgresqlDatabase>;
  let mockReply: FastifyReply;

  beforeEach(() => {
    // Resolve the mock PostgresqlDatabase instance from tsyringe container
    mockPostgresqlDatabase = container.resolve(PostgresqlDatabase) as jest.Mocked<PostgresqlDatabase>;

    // Create a new instance of RepositoryController with the mocked PostgresqlDatabase
    repositoryController = new ReposotoryController(mockPostgresqlDatabase);

    // Mock request and reply objects

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply;

    // Clear all mock calls between tests
    jest.clearAllMocks();
  });

  describe('getTopCommitAuthors', () => {
    it('should return 400 if count is invalid', async () => {
      const mockRequest = {
        params: { count: 'invalid' },
      } as FastifyRequest<{ Params: { count: string } }>;

      await repositoryController.getTopCommitAuthors(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid count parameter' });
    });

    it('should return top commit authors', async () => {
      const authors = [{ name: 'Author1', commits: 10 }];
      mockPostgresqlDatabase.getTopCommitAuthors.mockResolvedValue(authors);
      const mockRequest = {
        params: { count: '5' },
      } as FastifyRequest<{ Params: { count: string } }>;

      await repositoryController.getTopCommitAuthors(mockRequest, mockReply);

      expect(mockPostgresqlDatabase.getTopCommitAuthors).toHaveBeenCalledWith(5);
      expect(mockReply.send).toHaveBeenCalledWith(SuccessResponse('Top 5 authors retrieved successufully', authors));
    });
  });

  describe('getCommitsByRepository', () => {
    it('should return 400 if limit is invalid', async () => {
      const mockRequest = {
        params: { repositoryName: 'repo1' },
        query: { limit: 'invalid' },
      } as FastifyRequest<{ Params: { repositoryName: string }; Querystring: { limit?: string } }>;

      await repositoryController.getCommitsByRepository(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid limit parameter' });
    });

    it('should return commits for the repository', async () => {
      const commits = [{ message: 'Initial commit', author: 'Author1' }];
      mockPostgresqlDatabase.getCommitsByRepository.mockResolvedValue(commits);
      mockPostgresqlDatabase.getCommitsByRepository.mockResolvedValue(commits);
      const mockRequest = {
        params: { repositoryName: 'repo1' },
        query: { limit: '10' },
      } as FastifyRequest<{ Params: { repositoryName: string }; Querystring: { limit?: string } }>;

      await repositoryController.getCommitsByRepository(mockRequest, mockReply);

      expect(mockPostgresqlDatabase.getCommitsByRepository).toHaveBeenCalledWith('repo1', 10);
      expect(mockReply.send).toHaveBeenCalledWith(
        SuccessResponse('Commits for Repository Retrieved Sucessfully', commits),
      );
    });

    it('should return commits for the repository with no limit', async () => {
      const commits = [{ message: 'Initial commit', author: 'Author1' }];
      mockPostgresqlDatabase.getCommitsByRepository.mockResolvedValue(commits);
      const mockRequest = {
        params: { repositoryName: 'repo1' },
        query: {},
      } as FastifyRequest<{ Params: { repositoryName: string }; Querystring: { limit?: string } }>;

      await repositoryController.getCommitsByRepository(mockRequest, mockReply);

      expect(mockPostgresqlDatabase.getCommitsByRepository).toHaveBeenCalledWith('repo1', undefined);
      expect(mockReply.send).toHaveBeenCalledWith(
        SuccessResponse('Commits for Repository Retrieved Sucessfully', commits),
      );
    });
  });
});
