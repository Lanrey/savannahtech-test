export interface DatabseConfig {
  client: string;
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}

export interface Config {
  defaultOwner: string;
  defaultRepo: string;
  databaseType: string;
  cronSchedule: string;
  startDate?: string;
  database: DatabseConfig;
}

const config: Config = {
  defaultOwner: process.env.DEFAULT_OWNER || 'chromium',
  defaultRepo: process.env.DEFAULT_REPO || 'chromium',
  databaseType: process.env.DATABASE_TYPE || 'postgresql',
  cronSchedule: process.env.CRON_SCHEDULE || '0 * * * *',
  startDate: process.env.START_DATE,
  database: {
    client: 'postgres',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'github_monitor',
    },
  },
};

export default config;
