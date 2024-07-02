import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './user.repository';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [DatabaseModule, UploadModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
