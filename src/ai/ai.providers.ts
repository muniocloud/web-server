import { ConfigService } from '@nestjs/config';
import { GENERATIVE_AI_PROVIDER } from './ai.constants';
import { GeminiProvider } from './gemini.provider';

export const aiProviders = [
  {
    provide: GENERATIVE_AI_PROVIDER,
    useFactory: (configService: ConfigService) => {
      return new GeminiProvider(configService);
    },
    inject: [ConfigService],
  },
];
