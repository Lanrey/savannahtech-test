import 'reflect-metadata';
import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ConfigController } from '../controllers/config';
import { createDatabase } from '../factories/DatabaseFactory';
import { setupRepositoryEventHandlers } from '../events/repositoryEventHandlers';
import { RepositoryMonitor } from '../services/RepositoryMonitor';
import PublishEvent from '../../common/event/services/publish-event-service';
import config from '../../../../config/config';
import { SuccessResponse } from '../../../../shared/utils/response.util';

jest.mock('../factories/DatabaseFactory');
jest.mock('../events/repositoryEventHandlers');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

describe('ConfigController', () => {
  let configController: ConfigController;
  let mockDatabase: any;
  let mockRepoMonitor: jest.Mocked<RepositoryMonitor>;
  let mockPublishEvent: jest.Mocked<PublishEvent>;
  let mockRequest: FastifyRequest<{ Body: any }>;
  let mockReply: FastifyReply;

  beforeEach(() => {
    mockDatabase = { init: jest.fn() };
    (createDatabase as jest.Mock).mockReturnValue(mockDatabase);

    mockRepoMonitor = {
      stopMonitoring: jest.fn(),
      initializeAndMonitor: jest.fn(),
    } as unknown as jest.Mocked<RepositoryMonitor>;

    mockPublishEvent = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<PublishEvent>;

    container.registerInstance(RepositoryMonitor, mockRepoMonitor);
    container.registerInstance(PublishEvent, mockPublishEvent);

    configController = container.resolve(ConfigController);

    mockRequest = {
      body: {},
    } as FastifyRequest<{ Body: any }>;

    mockReply = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    jest.clearAllMocks();

    config.defaultOwner = 'defaultOwner';
    config.defaultRepo = 'defaultRepo';
    config.databaseType = 'postgresql';
    config.cronSchedule = '0 * * * *';
    config.startDate = '2023-01-01';
  });

  it('should update configuration with provided values', async () => {
    mockRequest.body = {
      defaultOwner: 'newOwner',
      defaultRepo: 'newRepo',
      databaseType: 'mongodb',
      cronSchedule: '*/30 * * * *',
      startDate: '2023-06-01',
    };

    await configController.dynamicConfig(mockRequest, mockReply);

    expect(config.defaultOwner).toBe('newOwner');
    expect(config.defaultRepo).toBe('newRepo');
    expect(config.databaseType).toBe('mongodb');
    expect(config.cronSchedule).toBe('*/30 * * * *');
    expect(config.startDate).toBe('2023-06-01');

    expect(createDatabase).toHaveBeenCalledWith('mongodb');
    expect(mockDatabase.init).toHaveBeenCalled();
    expect(setupRepositoryEventHandlers).toHaveBeenCalled();
    expect(mockRepoMonitor.stopMonitoring).not.toHaveBeenCalled(); // Since it's the first call
    expect(mockPublishEvent.execute).toHaveBeenCalledWith({
      eventId: 'mock-uuid',
      type: 'test-asoro-template',
      payload: config,
      saveIfPublishFailed: true,
    });
    expect(mockReply.send).toHaveBeenCalledWith(
      SuccessResponse('Configuration updated successfully, You can now query the services and database'),
    );
  });

  it('should use default values when not provided', async () => {
    await configController.dynamicConfig(mockRequest, mockReply);

    expect(config.defaultOwner).toBe('defaultOwner');
    expect(config.defaultRepo).toBe('defaultRepo');
    expect(config.databaseType).toBe('postgresql');
    expect(config.cronSchedule).toBe('0 * * * *');
    expect(config.startDate).toBe('2023-01-01');

    expect(createDatabase).toHaveBeenCalledWith('postgresql');
    expect(mockDatabase.init).toHaveBeenCalled();
    expect(setupRepositoryEventHandlers).toHaveBeenCalled();
    expect(mockRepoMonitor.stopMonitoring).not.toHaveBeenCalled(); // Since it's the first call
    expect(mockPublishEvent.execute).toHaveBeenCalledWith({
      eventId: 'mock-uuid',
      type: 'test-asoro-template',
      payload: config,
      saveIfPublishFailed: true,
    });
    expect(mockReply.send).toHaveBeenCalledWith(
      SuccessResponse('Configuration updated successfully, You can now query the services and database'),
    );
  });

  it('should stop existing monitoring if it was running', async () => {
    // Simulate that the repository monitor is already running
    configController.setRepoMonitor(mockRepoMonitor);

    await configController.dynamicConfig(mockRequest, mockReply);

    expect(mockRepoMonitor.stopMonitoring).toHaveBeenCalled();
    expect(mockRepoMonitor.initializeAndMonitor).not.toHaveBeenCalled(); // As it's commented out in the code

    expect(mockReply.send).toHaveBeenCalledWith(
      SuccessResponse('Configuration updated successfully, You can now query the services and database'),
    );
  });

  it('should handle errors and send 500 status', async () => {
    const error = new Error('Something went wrong');
    mockDatabase.init.mockRejectedValueOnce(error);

    await configController.dynamicConfig(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'An error occurred while updating the configuration' });
  });
});
