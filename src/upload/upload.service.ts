import { Inject, Injectable } from '@nestjs/common';
import { FILE_UPLOAD_PROVIDER } from './upload.contants';
import { UploadInput, UploadProvider } from './upload.types';

@Injectable()
export class UploadService {
  constructor(
    @Inject(FILE_UPLOAD_PROVIDER)
    private uploader: UploadProvider,
  ) {}

  async upload(input: UploadInput) {
    return this.uploader.upload(input);
  }
}
