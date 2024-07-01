export type UploadInput = {
  buffer: Buffer;
  type: string;
  contentType: string;
};

export interface UploadProvider {
  upload: (input: UploadInput) => Promise<string>;
}
