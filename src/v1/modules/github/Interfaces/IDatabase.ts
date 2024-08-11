export interface IDatabase {
  init(): Promise<void>;
  saveRepository(repo: any): Promise<number>;
  saveCommit(repositoryId: number, commit: any): Promise<void>;
  getTopCommitAuthors(n: number): Promise<any[]>;
  getCommitsByRepository(repositoryName: string, limit?: number): Promise<any[]>;
  getLatestCommit(repositoryId: number): Promise<any>;
  getEarliestCommit(repositoryId: number): Promise<any>;
  deleteCommitsSince(repositoryId: number, date: string): Promise<void>;
  commitExists(repositoryId: number, sha: string): Promise<boolean>;
}
