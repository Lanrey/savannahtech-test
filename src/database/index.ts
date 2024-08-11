import Knex from 'knex';
import { Knex as IKnex } from 'knex/types';
import { Model } from 'objection';
import knexConfig from '../../knexfile';

let knex: IKnex;

export default function init() {
  knex = Knex(knexConfig);
  Model.knex(knex);

  return knex;
}

export function getDB() {
  return knex;
}
