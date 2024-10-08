import { BaseModel } from './base.model';
import { Repository } from './repository.model';

export class Commit extends BaseModel {
  static tableName = 'commits';

  repository_id!: number;
  sha!: string;
  message!: string;
  author!: string;
  date!: Date;
  url!: string;

  static relationMappings = {
    repository: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: Repository,
      join: {
        from: 'commits.repository_id',
        to: 'repositories.id',
      },
    },
  };
}
