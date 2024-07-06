import {
  GenerativeModel,
  InlineDataPart,
  ModelParams,
  RequestOptions,
} from '@google/generative-ai';

export interface GenerativeAIProvider {
  createGenerativeModel(
    modelParams: ModelParams,
    requestOptions?: RequestOptions | undefined,
  ): GenerativeModel;
  createFilePart(file: Express.Multer.File): InlineDataPart;
}
