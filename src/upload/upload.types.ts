export type UploadInput = {
  buffer: Buffer;
  type: string;
  contentType: string;
};

export interface UploadProvider {
  upload: (file: Express.Multer.File, customName?: string) => Promise<string>;
}
