import { IDatabase } from '../Interfaces/IDatabase';
import { PostgresqlDatabase } from '../services/PostgresqlDatabase';

export enum DatabaseType {
  PostgreSQL = 'postgresql',
  // Add more database types here as needed, e.g.. MongoDB, sql
}

export class DatabaseFactory {
  static createDatabase(type: DatabaseType): IDatabase {
    switch (type) {
      case DatabaseType.PostgreSQL:
        return new PostgresqlDatabase();
      // Add more cases for otther database types
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}
