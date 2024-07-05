import { Module } from '@nestjs/common';
import { aiProviders } from './ai.providers';

@Module({
  providers: [...aiProviders],
  exports: [...aiProviders],
})
export class AiModule {}
