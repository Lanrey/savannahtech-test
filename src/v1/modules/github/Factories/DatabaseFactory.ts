import { IDatabase } from '../Interfaces/IDatabase';
import { PostgresqlDatabase } from '../services/PostgresqlDatabase';
import { injectable, container } from 'tsyringe';

export enum DatabaseType {
  PostgreSQL = 'postgresql',
  // Add more database types here as needed, e.g., MongoDB, MySQL
}

type DatabaseCreator = () => IDatabase;

@injectable()
export class DatabaseFactory {
  private databaseCreators: Map<DatabaseType, DatabaseCreator>;

  constructor() {
    this.databaseCreators = new Map<DatabaseType, DatabaseCreator>([
      [DatabaseType.PostgreSQL, () => container.resolve(PostgresqlDatabase)],
      // Add more database types here as needed
    ]);
  }

  createDatabase(type: DatabaseType): IDatabase {
    const creator = this.databaseCreators.get(type);
    if (!creator) {
      throw new Error(`Unsupported database type: ${type}`);
    }
    return creator();
  }
}

// Helper function to create a database using the container
export function createDatabase(type: DatabaseType): IDatabase {
  const factory = container.resolve(DatabaseFactory);
  return factory.createDatabase(type);
}
