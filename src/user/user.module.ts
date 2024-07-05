import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './user.repository';
import { UploadModule } from 'src/upload/upload.module';
import { UserController } from './user.controller';

@Module({
  imports: [DatabaseModule, UploadModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
