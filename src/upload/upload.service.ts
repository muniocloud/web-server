import { Inject, Injectable } from '@nestjs/common';
import { FILE_UPLOAD_GCS_PROVIDER } from './upload.contants';
import { UploadProvider } from './upload.types';

@Injectable()
export class UploadService {
  constructor(
    @Inject(FILE_UPLOAD_GCS_PROVIDER)
    private gcsUploader: UploadProvider,
  ) {}

  async upload(file: Express.Multer.File, customName: string = '') {
    return this.gcsUploader.upload(file, customName);
  }
}
