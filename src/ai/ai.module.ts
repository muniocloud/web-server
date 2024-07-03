import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { aiProviders } from './ai.providers';

@Module({
  providers: [...aiProviders, AiService],
  exports: [...aiProviders],
})
export class AiModule {}
