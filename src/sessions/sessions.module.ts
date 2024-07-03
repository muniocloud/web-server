import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { UploadModule } from 'src/upload/upload.module';
import { SessionsRepository } from './sessions.repository';
import { DatabaseModule } from 'src/database/database.module';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [UploadModule, DatabaseModule, AiModule],
  providers: [SessionsService, SessionsRepository],
  controllers: [SessionsController],
})
export class SessionsModule {}
