import { repositoryEvents, CommitEvent, RepositoryUpdateEvent } from './repositoryEvents';

export function setupRepositoryEventHandlers() {
  repositoryEvents.on('newCommit', handleNewCommit);
  repositoryEvents.on('repositoryUpdated', handleRepositoryUpdated);
}

function handleNewCommit(event: CommitEvent) {
  console.log(`New commit detected for repository ${event.repositoryId}:`);
  console.log(`SHA: ${event.commit.sha}`);
  console.log(`Message: ${event.commit.commit.message}`);
  console.log(`Author: ${event.commit.commit.author.name}`);
  console.log(`Date: ${event.commit.commit.author.date}`);
}

function handleRepositoryUpdated(event: RepositoryUpdateEvent) {
  console.log(`Repository ${event.owner}/${event.repo} updated at ${event.updatedAt}`);
}
