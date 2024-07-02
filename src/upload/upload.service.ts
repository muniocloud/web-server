import { Inject, Injectable } from '@nestjs/common';
import { FILE_UPLOAD_PROVIDER } from './upload.contants';
import { UploadProvider } from './upload.types';

@Injectable()
export class UploadService {
  constructor(
    @Inject(FILE_UPLOAD_PROVIDER)
    private uploader: UploadProvider,
  ) {}

  async upload(file: Express.Multer.File, customName: string = '') {
    return this.uploader.upload(file, customName);
  }
}
