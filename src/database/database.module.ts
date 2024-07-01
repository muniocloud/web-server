import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
  imports: [ConfigModule],
})
export class DatabaseModule {}
