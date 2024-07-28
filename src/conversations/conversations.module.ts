import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
import { AiModule } from 'src/ai/ai.module';
import { DatabaseModule } from 'src/database/database.module';
import { ConversationsGateway } from './conversations.gateway';
import { TTSModule } from 'src/tts/tts.module';

@Module({
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    ConversationsRepository,
    ConversationsGateway,
  ],
  imports: [AiModule, DatabaseModule, TTSModule],
})
export class ConversationsModule {}
