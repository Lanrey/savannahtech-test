import { AxiosInstance } from 'axios';
import { injectable } from 'tsyringe';
import HTTPClient from '@shared/http-client/http-client';
import appConfig from '@config/app.config';
import { handleServiceError } from '@shared/error/error.util';
import logger from '@shared/utils/logger';

@injectable()
export class GithubApiService {
  private githubHttpClient: AxiosInstance;

  constructor() {
    this.githubHttpClient = HTTPClient.create({
      baseURL: appConfig.github.host,
    });
  }

  async getRepositoryInfo(owner: string, repo: string): Promise<any> {
    try {
      const response = await this.githubHttpClient.get(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      logger.error(error, 'Unable to get repository from github');
      handleServiceError(error, 'Unable to get repository from github');

      throw error;
    }
  }

  async getCommits(owner: string, repo: string, since?: string): Promise<any[]> {
    try {
      const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
      let pagesRemaining = true;
      let data: any = [];
      let url = `/repos/${owner}/${repo}/commits`;
      let page = 1;
      const perPage = 100;
      const params: any = { page, per_page: perPage };
      if (since) {
        params.since = since;
      }

      while (pagesRemaining) {
        const response = await this.githubHttpClient.get(`${url}`, { params });

        const parsedData = this.parseData(response.data);
        data = [...data, ...parsedData];

        const linkHeader = response.headers.link;

        // eslint-disable-next-line no-useless-escape
        pagesRemaining = linkHeader && linkHeader.includes(`rel=\"next\"`);

        if (pagesRemaining) {
          url = linkHeader.match(nextPattern)[0];
          page++;
        }
      }

      return data;
    } catch (error) {
      logger.error(error, 'Unable to get commits from repository from github');
      handleServiceError(error, 'Unable to get commits from repository from github');

      throw error;
    }
  }

  private parseData(data) {
    // if the data is an array, return that
    if (Array.isArray(data)) {
      return data;
    }

    if (!data) {
      return [];
    }

    // otherwise, the array of items that we want is in an object

    delete data.incomplete_results;
    delete data.respository_selection;
    delete data.total_count;

    // Pull out the array of items

    const namespaceKey = Object.keys(data)[0];
    data = data[namespaceKey];

    return data;
  }
}
