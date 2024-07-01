import { ConfigService } from '@nestjs/config';
import { GCSProvider } from './gcs.provider';
import { UploadProvider } from './upload.types';
import { FILE_UPLOAD_PROVIDER } from './upload.contants';

export const uploadProviders = [
  {
    provide: FILE_UPLOAD_PROVIDER,
    useFactory: (configService: ConfigService): UploadProvider => {
      return new GCSProvider(configService);
    },
    inject: [ConfigService],
  },
];
