/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST || undefined,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || undefined,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: 'src/database/migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: 'src/database/seeds',
    },
  };
  