import { ConfigService } from '@nestjs/config';
import { TTSProvider } from './tts.types';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { JWT } from 'google-auth-library';

export class GTTSProvider implements TTSProvider {
  private readonly client: TextToSpeechClient;

  constructor(private readonly configService: ConfigService) {
    const client = new JWT();
    client.fromAPIKey(configService.getOrThrow('GOOGLE_TTS_API_KEY'));
    this.client = new TextToSpeechClient({
      authClient: client,
    });
  }

  async textToSpeech(text: string): Promise<Buffer> {
    const [response] = await this.client.synthesizeSpeech({
      audioConfig: {
        audioEncoding: 'MP3',
      },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Journey-F',
      },
      input: { text },
    });

    return response.audioContent as Buffer;
  }
}
