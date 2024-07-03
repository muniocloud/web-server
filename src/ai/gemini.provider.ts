import { ConfigService } from '@nestjs/config';
import {
  GenerativeModel,
  GoogleGenerativeAI,
  InlineDataPart,
  ModelParams,
  RequestOptions,
} from '@google/generative-ai';
import { GenerativeAIProvider } from './ai.type';

export class GeminiProvider implements GenerativeAIProvider {
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.getOrThrow('GOOGLE_GENERATIVE_AI_API_KEY'),
    );
  }

  createGenerativeModel(
    modelParams: ModelParams,
    requestOptions?: RequestOptions | undefined,
  ): GenerativeModel {
    return this.genAI.getGenerativeModel(modelParams, requestOptions);
  }

  createFilePart(file: Express.Multer.File): InlineDataPart {
    return {
      inlineData: {
        data: file.buffer.toString('base64'),
        mimeType: file.mimetype,
      },
    };
  }
}
