import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { uploadProviders } from './upload.providers';

@Module({
  providers: [...uploadProviders, UploadService],
  exports: [UploadService],
})
export class UploadModule {}
