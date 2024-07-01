import { DATA_SOURCE_PROVIDER } from './database.constants';
import knex from 'knex';
import createConfig from './database.data-source.config';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: DATA_SOURCE_PROVIDER,
    useFactory: async (configService: ConfigService) => {
      const dataSourceConfig = createConfig(
        configService.getOrThrow('MYSQL_DATA_SOURCE_HOST'),
        configService.getOrThrow('MYSQL_DATA_SOURCE_PORT'),
        configService.getOrThrow('MYSQL_DATA_SOURCE_USER'),
        configService.getOrThrow('MYSQL_DATA_SOURCE_USER_PASSWORD'),
        configService.getOrThrow('MYSQL_DATA_SOURCE_DB_NAME'),
      );
      return knex(dataSourceConfig);
    },
    inject: [ConfigService],
  },
];
