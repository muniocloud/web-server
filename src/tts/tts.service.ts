import { Inject, Injectable } from '@nestjs/common';
import { GTTS_PROVIDER } from './tts.constants';
import { TTSProvider } from './tts.types';

@Injectable()
export class TTSService {
  constructor(
    @Inject(GTTS_PROVIDER)
    private tssProvider: TTSProvider,
  ) {}

  speechToText(text: string) {
    return this.tssProvider.textToSpeech(text);
  }
}
