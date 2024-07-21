import createConfig from './src/database/database.data-source.config';

module.exports = createConfig(
  process.env.MYSQL_DATA_SOURCE_HOST ?? '',
  process.env.MYSQL_DATA_SOURCE_PORT ?? '',
  process.env.MYSQL_DATA_SOURCE_USER ?? '',
  process.env.MYSQL_DATA_SOURCE_USER_PASSWORD ?? '',
  process.env.MYSQL_DATA_SOURCE_DB_NAME ?? '',
  process.env.MYSQL_DATA_SOURCE_MIGRATION_TABLE_NAME ?? '',
);
