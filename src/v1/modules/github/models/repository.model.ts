import { BaseModel } from './base.model';
import { Commit } from './commit.model';

export class Repository extends BaseModel {
  static tableName = 'repositories';

  name!: string;
  description?: string;
  url!: string;
  language?: string;
  forks_count!: number;
  stars_count!: number;
  open_issues_count!: number;
  watchers_count!: number;

  static relationMappings = {
    commits: {
      relation: BaseModel.HasManyRelation,
      modelClass: Commit,
      join: {
        from: 'repositories.id',
        to: 'commits.repository_id',
      },
    },
  };
}
