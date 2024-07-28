import { BasicData } from 'src/shared/shared.types';

export type UploadInput = {
  buffer: Buffer;
  type: string;
  contentType: string;
};

export interface UploadProvider {
  upload: (
    file: Express.Multer.File | BasicData,
    customName?: string,
  ) => Promise<string>;
}
