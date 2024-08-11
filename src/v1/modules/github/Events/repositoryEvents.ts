import { EventEmitter } from 'events';

export interface CommitEvent {
  repositoryId: number;
  commit: any;
}

export interface RepositoryUpdateEvent {
  owner: string;
  repo: string;
  updatedAt: Date;
}

class RepositoryEventEmitter extends EventEmitter {
  emitNewCommit(event: CommitEvent) {
    this.emit('newCommit', event);
  }

  emitRepositoryUpdated(event: RepositoryUpdateEvent) {
    this.emit('repositoryUpdated', event);
  }
}

export const repositoryEvents = new RepositoryEventEmitter();
