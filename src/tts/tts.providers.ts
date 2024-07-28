import { ConfigService } from '@nestjs/config';
import { GTTS_PROVIDER } from './tts.constants';
import { GTTSProvider } from './google-text-to-speech.provider';

export const ttsProviders = [
  {
    provide: GTTS_PROVIDER,
    useFactory: (configService: ConfigService) => {
      return new GTTSProvider(configService);
    },
    inject: [ConfigService],
  },
];
