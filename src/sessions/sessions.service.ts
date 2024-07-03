import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GENERATIVE_AI_PROVIDER } from 'src/ai/ai.constants';
import { GenerativeAIProvider } from 'src/ai/ai.type';
import { CreateSessionInput } from './type/sessions.type';
import { SessionsRepository } from './sessions.repository';
import { FunctionDeclarationSchemaType } from '@google/generative-ai';
import { AuthUser } from 'src/auth/type/authuser.type';
import { phrasesShema } from './validator/generative.validator';
import { SESSION_LEVEL } from './sessions.constants';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(GENERATIVE_AI_PROVIDER)
    private generativeAI: GenerativeAIProvider,
    private sessionsRepository: SessionsRepository,
  ) {}

  async createSession(input: CreateSessionInput, user: AuthUser) {
    const level = SESSION_LEVEL[input.level];
    const model = this.generativeAI.createGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are a english teacher and the user requested to you generate some phrases to him practise your speaking and pronunciation.
Response with following json schema: an array of objects, each object has a property called phrase.
Follow the amount of lessons especified by user on 'Lessons:', example: Lessons: 3
Follow the phrase context especified by user on 'Context:', example: Context: routine
Follow the phrase level especified by user on 'Level:', example: Level: easy
Be strict about my instructions and user request.`,
      generationConfig: {
        responseSchema: {
          type: FunctionDeclarationSchemaType.ARRAY,
          items: {
            type: FunctionDeclarationSchemaType.OBJECT,
            properties: {
              phrase: {
                type: FunctionDeclarationSchemaType.STRING,
              },
            },
          },
        },
        responseMimeType: 'application/json',
      },
    });

    const request = await model.generateContent([
      `The user request: Lessons: ${input.lessons}; Level: ${level}; Context: ${input.context}.`,
    ]);

    const data = request.response.text();
    const phrases = JSON.parse(data);

    const { success, error } = phrasesShema.safeParse(phrases);

    if (success) {
      return this.sessionsRepository.createSession({
        ...input,
        userId: +user.id,
        lessonsItems: phrases,
      });
    }

    throw new InternalServerErrorException(error);
  }
}
