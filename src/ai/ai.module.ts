import { Module } from '@nestjs/common';
import { aiProviders } from './ai.providers';
import { AiService } from './ai.service';

@Module({
  providers: [...aiProviders, AiService],
  exports: [AiService],
})
export class AiModule {}
