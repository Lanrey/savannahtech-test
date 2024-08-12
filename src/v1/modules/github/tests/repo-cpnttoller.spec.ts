import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ReposotoryController } from '../controllers/repository'; // Adjust path as necessary
import { SuccessResponse } from '../../../../shared/utils/response.util';
import { createDatabase } from '../factories/database.factory'; // Import the factory
import { mock } from 'jest-mock-extended';
import { IDatabase } from '../Interfaces/IDatabase'; // Adjust path as necessary

jest.mock('../factories/DatabaseFactory');

describe('RepositoryController', () => {
  let repositoryController: ReposotoryController;
  let mockDatabase: jest.Mocked<IDatabase>;
  let mockReply: FastifyReply;

  beforeEach(() => {
    // Create a mock database instance
    mockDatabase = mock<IDatabase>();

    // Mock the createDatabase function to return the mock database
    (createDatabase as jest.Mock).mockReturnValue(mockDatabase);

    // Instantiate the RepositoryController (no need to resolve from container)
    repositoryController = new ReposotoryController();

    // Mock Fastify's reply object
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
        query: { count: 'invalid' },
      } as FastifyRequest<{ Querystring: { count: string } }>;

      await repositoryController.getTopCommitAuthors(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid count parameter' });
    });

    it('should return top commit authors', async () => {
      const authors = [{ name: 'Author1', commits: 10 }];
      mockDatabase.getTopCommitAuthors.mockResolvedValue(authors);
      const mockRequest = {
        query: { count: '5' },
      } as FastifyRequest<{ Querystring: { count: string } }>;

      await repositoryController.getTopCommitAuthors(mockRequest, mockReply);

      expect(mockDatabase.getTopCommitAuthors).toHaveBeenCalledWith(5);
      expect(mockReply.send).toHaveBeenCalledWith(SuccessResponse('Top 5 authors retrieved successfully', authors));
    });
  });

  describe('getCommitsByRepository', () => {
    it('should return 400 if limit is invalid', async () => {
      const mockRequest = {
        query: { limit: 'invalid', repositoryName: 'repo1' },
      } as FastifyRequest<{ Querystring: { limit?: string; repositoryName: string } }>;

      await repositoryController.getCommitsByRepository(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid limit parameter' });
    });

    it('should return commits for the repository', async () => {
      const commits = [{ message: 'Initial commit', author: 'Author1' }];
      mockDatabase.getCommitsByRepository.mockResolvedValue(commits);
      const mockRequest = {
        query: { limit: '10', repositoryName: 'repo1' },
      } as FastifyRequest<{ Querystring: { limit?: string; repositoryName: string } }>;

      await repositoryController.getCommitsByRepository(mockRequest, mockReply);

      expect(mockDatabase.getCommitsByRepository).toHaveBeenCalledWith('repo1', 10);
      expect(mockReply.send).toHaveBeenCalledWith(
        SuccessResponse('Commits for Repository Retrieved Successfully', commits),
      );
    });

    it('should return commits for the repository with no limit', async () => {
      const commits = [{ message: 'Initial commit', author: 'Author1' }];
      mockDatabase.getCommitsByRepository.mockResolvedValue(commits);
      const mockRequest = {
        query: { repositoryName: 'repo1' },
      } as FastifyRequest<{ Querystring: { limit?: string; repositoryName: string } }>;

      await repositoryController.getCommitsByRepository(mockRequest, mockReply);

      expect(mockDatabase.getCommitsByRepository).toHaveBeenCalledWith('repo1', undefined);
      expect(mockReply.send).toHaveBeenCalledWith(
        SuccessResponse('Commits for Repository Retrieved Successfully', commits),
      );
    });
  });
});
