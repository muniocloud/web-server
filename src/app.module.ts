import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SessionsModule } from './sessions/sessions.module';
import { AiModule } from './ai/ai.module';
import { ConversationsModule } from './conversations/conversations.module';

const NODE_ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env${NODE_ENV === 'production' ? '' : `.${NODE_ENV}`}`,
    }),
    DatabaseModule,
    UploadModule,
    AuthModule,
    UserModule,
    SessionsModule,
    AiModule,
    ConversationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
