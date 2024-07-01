import knex from 'knex';

const createConfig = (
  host: string,
  port: string,
  user: string,
  password: string,
  database: string,
  migrationTableName?: string,
): knex.Knex.Config => {
  return {
    client: 'mysql2',
    connection: {
      host,
      port: parseInt(port) ?? 3306,
      user,
      password,
      database,
    },
    pool: {
      max: 10,
      min: 2,
    },
    migrations: {
      tableName: migrationTableName,
      extension: 'ts',
      directory: __dirname + '/../../migrations/',
      loadExtensions: ['.ts'],
    },
    useNullAsDefault: true,
  };
};

export default createConfig;
