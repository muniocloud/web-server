import { UploadProvider } from './upload.types';
import { randomUUID } from 'crypto';
import { Bucket, File, Storage, StorageOptions } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

export class GCSProvider implements UploadProvider {
  private readonly gcsStorage: Storage;
  private readonly bucket: Bucket;

  constructor(private readonly configService: ConfigService) {
    this.gcsStorage = new Storage(this.createStorageOptions());
    this.bucket = this.gcsStorage.bucket(
      this.configService.getOrThrow('GOOGLE_GCS_BUCKET'),
    );
  }

  private getAPIEndpoint() {
    return this.configService.get('GOOGLE_GCS_ENDPOINT');
  }

  private createStorageOptions(): StorageOptions {
    if (this.configService.get('NODE_ENV') === 'development') {
      return {
        apiEndpoint: this.getAPIEndpoint(),
      };
    }

    return {};
  }

  private createFileKey(customName: string = '') {
    const timestamp = Date.now();
    return `${randomUUID().substring(0, 8)}${timestamp}${customName}`.replaceAll(
      '-',
      '',
    );
  }

  async upload(file: Express.Multer.File, customName: string = '') {
    const cloudFile = this.bucket.file(this.createFileKey(customName));

    await cloudFile.save(file.buffer, {
      contentType: file.mimetype,
      public: true,
    });

    return this.getFileUrl(cloudFile);
  }

  private getFileUrl(file: File) {
    if (this.configService.get('NODE_ENV') === 'development') {
      return `http://localhost:4443/download/storage/v1/b/${this.configService.getOrThrow('GOOGLE_GCS_BUCKET')}/o/${file.id}?alt=media`;
    }

    return file.publicUrl();
  }
}
