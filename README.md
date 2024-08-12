# GitHub Repository Monitor

## Table of Contents
1. [Introduction](#introduction)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Endpoints](#api-endpoints)
7. [Design Decisions](#design-decisions)
8. [Improvements](#improvements)
9. [Testing](#testing)
10. [Contributing](#contributing)

## Introduction

The GitHub Repository Monitor is a service that fetches data from GitHub's public APIs to retrieve repository information and commits. It stores this data in a persistent database and continuously monitors repositories for changes. This project is built with TypeScript, Fastify, and uses PostgreSQL as the default database.

## Requirements

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL (v12 or later)
- Redis (v6 or later)

## Installation

1. Clone the repository:
2. Install dependencies:
3. Set up your environment variables by creating a `.env` file in the root directory. Use the `.env.example` file as a template.

4. Set up the database:

To switch to a different database like MongoDB, you would:

Create a new database service class (e.g., MongoDatabase) that implements the IDatabase interface.
Add a new case in the DatabaseFactory for MongoDB.
Update the config.ts file to include MongoDB connection details.

This structure allows you to easily switch between different databases while keeping the core logic of your application intact. The use of Knex and Objection provides a robust ORM solution for PostgreSQL, making it easier to work with the database and perform complex queries.

## Configuration

The application uses a configuration file located at `src/config/config.ts`. You can modify the default values in this file or override them using environment variables.

Key configuration options:
- `defaultOwner`: Default GitHub repository owner
- `defaultRepo`: Default GitHub repository name
- `databaseType`: Type of database to use (default: 'postgresql')
- `cronSchedule`: Cron schedule for repository monitoring
- `database`: Database connection details

## Usage

To start the server:
For development with hot-reloading: npm run start:dev

## API Endpoints

1. Update Configuration
   - URL: `/api/v1/setup/new-repo`
   - Method: `POST`
   - Body:
     ```json
     {
       "defaultOwner": "string",
       "defaultRepo": "string",
       "databaseType": "string",
       "cronSchedule": "string",
       "startDate": "string"
     }
     ```

2. Get Top Commit Authors
   - URL: `/api/v1/github-monitor/top-authors/:count`
   - Method: `GET`
   - Params: `count` (number of top authors to retrieve)

3. Get Commits by Repository
   - URL: `/api/v1/github-monitor/commits/:repositoryName`
   - Method: `GET`
   - Params: `repositoryName`
   - Query: `limit` (optional, number of commits to retrieve)

## Design Decisions

1. **Fastify Framework**: Chosen for its high performance and low overhead.
2. **PostgreSQL**: Used as the default database for its robustness and support for complex queries.
3. **Redis Caching**: Implemented to improve performance and reduce load on the database.
4. **Dependency Injection**: Utilized `tsyringe` for better testability and modularity.
5. **Repository Pattern**: Implemented to abstract database operations and allow for easy switching between database types.
6. **Event-Driven Architecture**: Used for decoupling components and improving extensibility.

## Improvements

1. Implement rate limiting for GitHub API requests to avoid hitting API limits.
2. Add more comprehensive error handling and logging.
3. Implement a more robust caching strategy, possibly with cache invalidation on specific events.
4. Add support for authentication to monitor private repositories.
5. Implement a dashboard for visualizing repository statistics.
6. Add support for webhook integration to receive real-time updates from GitHub.

## Testing

Run the test suite: npm test
For tests with database interactions: npm run test:with-db

## Postman
https://lunar-trinity-430229.postman.co/workspace/Team-Workspace~34e62003-3b98-4049-856f-fd72361d5f1e/collection/23325006-6ddf75c0-f54d-41f2-b5e9-cab6d678aef6?action=share&creator=23325006&active-environment=23325006-4ea21514-be24-48c7-a8bb-1ebcc4da495e

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request