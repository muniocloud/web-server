import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionsModule } from './sessions/sessions.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    SessionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
