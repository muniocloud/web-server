import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
import { AiModule } from 'src/ai/ai.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository],
  imports: [AiModule, DatabaseModule],
})
export class ConversationsModule {}
