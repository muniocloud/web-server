import { UploadInput, UploadProvider } from './upload.types';
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

  async upload({ buffer, contentType }: UploadInput) {
    const timestamp = Date.now();
    const key = `${randomUUID().substring(0, 8)}${timestamp}`.replaceAll(
      '-',
      '',
    );
    const file = this.bucket.file(key);

    await file.save(buffer, {
      contentType,
      private: false,
    });

    return this.getFileUrl(file);
  }

  private getFileUrl(file: File) {
    if (this.configService.get('NODE_ENV') === 'development') {
      return `http://localhost:4443/download/storage/v1/b/${this.configService.getOrThrow('GOOGLE_GCS_BUCKET')}/o/${file.id}?alt=media`;
    }

    return file.publicUrl();
  }
}
