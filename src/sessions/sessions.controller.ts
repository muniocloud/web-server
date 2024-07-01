import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FunctionDeclarationSchema,
  FunctionDeclarationSchemaType,
  GoogleGenerativeAI,
} from '@google/generative-ai';

@Controller('sessions')
export class SessionsController {
  fileToGenerativePart(file: Express.Multer.File) {
    return {
      inlineData: {
        data: file.buffer.toString('base64'),
        mimeType: file.mimetype,
      },
    };
  }

  @Post('check')
  @UseInterceptors(FileInterceptor('file'))
  async checkMessage(@UploadedFile() file: Express.Multer.File) {
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );
    const systemInstruction =
      'You are a english teacher and asked to user to pronunciate the phrase "Good morning". The user reponds in the audio bellow. Check their speaking and pronunciation and send feedbacks to improve. Follow the response schema, put your feedback on feedback property and user rating on rating property. The rating is based on 10, where 0 is very bad and 10 is very good.';
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
      generationConfig: {
        responseSchema: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            rating: {
              description: 'The rating based on feedback and the asked phrase.',
              type: FunctionDeclarationSchemaType.NUMBER,
            } as FunctionDeclarationSchema,
            feedback: {
              description: 'The teacher feedback about user audio',
              type: FunctionDeclarationSchemaType.STRING,
            } as FunctionDeclarationSchema,
          },
          required: ['rating', 'feedback'],
        },
        responseMimeType: 'application/json',
      },
    });
    const result = await model.generateContent([
      this.fileToGenerativePart(file),
    ]);
    console.log('file', file, result);
  }
}
