import { Model, QueryBuilder } from 'objection';
import { Pagination } from './pagination';
import { IPaginationOptions } from './interfaces';

export async function paginate<T extends Model>(
  queryBuilder: QueryBuilder<T, T[]>,
  options: IPaginationOptions,
): Promise<Pagination<T>> {
  const [page, limit] = resolveOptions(options);

  // the page function of the query builder starts from 0, therefore we need to subtract 1 from the page variable
  const queryBuilderPage = page - 1;

  const { results, total } = await queryBuilder.page(queryBuilderPage, limit);

  return createPaginationObject<T>(results, total, page, limit);
}

function createPaginationObject<T>(items: T[], totalItems: number, page: number, limit: number) {
  const totalPages = Math.ceil(totalItems / limit);

  return new Pagination(items, {
    total: totalItems,
    perPage: limit,
    totalPages: totalPages,
    page,
  });
}

function resolveOptions(options: IPaginationOptions): [number, number] {
  const page = options.page < 1 ? 1 : options.page;
  const size = options.size;

  return [page, size];
}
