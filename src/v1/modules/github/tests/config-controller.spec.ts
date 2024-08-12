import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RepositoryMonitor } from '../services/RepositoryMonitor';
import { ConfigController } from '../controllers/config';
import { createDatabase } from '../factories/DatabaseFactory';
import config from '../../../../config/config';
import { SuccessResponse } from '../../../../shared/utils/response.util';
import { container } from 'tsyringe';

// Mocks
jest.mock('../services/RepositoryMonitor');
jest.mock('../factories/DatabaseFactory');
jest.mock('../events/repositoryEventHandlers', () => ({
  setupRepositoryEventHandlers: jest.fn(),
}));
jest.mock('../../../../config/config', () => ({
  defaultOwner: 'defaultOwner',
  defaultRepo: 'defaultRepo',
  databaseType: 'postgresql',
  cronSchedule: '0 * * * *',
  startDate: '2023-01-01',
}));

describe('ConfigController', () => {
  let configController: ConfigController;
  let mockRepoMonitor: jest.Mocked<RepositoryMonitor>;
  let mockRequest: FastifyRequest<{ Body: any }>;
  let mockReply: FastifyReply;

  beforeEach(() => {
    mockRepoMonitor = container.resolve(RepositoryMonitor) as jest.Mocked<RepositoryMonitor>;
    mockRepoMonitor.stopMonitoring = jest.fn();
    mockRepoMonitor.initializeAndMonitor = jest.fn();
    configController = container.resolve(ConfigController);

    mockRequest = {
      body: {},
    } as FastifyRequest<{ Body: any }>;

    mockReply = {
      send: jest.fn(),
    } as unknown as FastifyReply;

    jest.clearAllMocks();

    Object.assign(config, {
      defaultOwner: 'defaultOwner',
      defaultRepo: 'defaultRepo',
      databaseType: 'postgresql',
      cronSchedule: '0 * * * *',
      startDate: '2023-01-01',
    });
  });

  it('should update configuration with provided values', async () => {
    mockRequest.body = {
      defaultOwner: 'newOwner',
      defaultRepo: 'newRepo',
      databaseType: 'mongodb',
      cronSchedule: '*/30 * * * *',
      startDate: '2023-06-01',
    };

    const mockDatabase = { init: jest.fn() };
    (createDatabase as jest.Mock).mockReturnValue(mockDatabase);

    await configController.dynamicConfig(mockRequest, mockReply);

    expect(config.defaultOwner).toBe('newOwner');
    expect(config.defaultRepo).toBe('newRepo');
    expect(config.databaseType).toBe('mongodb');
    expect(config.cronSchedule).toBe('*/30 * * * *');
    expect(config.startDate).toBe('2023-06-01');
  });

  it('should use default values when not provided', async () => {
    mockRequest.body = {};

    const mockDatabase = { init: jest.fn() };
    (createDatabase as jest.Mock).mockReturnValue(mockDatabase);

    await configController.dynamicConfig(mockRequest, mockReply);

    expect(config.defaultOwner).toBe('defaultOwner');
    expect(config.defaultRepo).toBe('defaultRepo');
    expect(config.databaseType).toBe('postgresql');
    expect(config.cronSchedule).toBe('0 * * * *');
    expect(config.startDate).toBe('2023-01-01');
  });

  it('should send a success response', async () => {
    await configController.dynamicConfig(mockRequest, mockReply);

    expect(mockReply.send).toHaveBeenCalledWith(
      SuccessResponse('Configuration updated successfully, You can now query the services and database'),
    );
  });

  // Add more tests as needed for error cases, edge cases, etc.
});
