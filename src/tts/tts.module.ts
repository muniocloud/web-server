import { Module } from '@nestjs/common';
import { TTSService } from './tts.service';
import { ttsProviders } from './tts.providers';

@Module({
  providers: [TTSService, ...ttsProviders],
  exports: [TTSService],
})
export class TTSModule {}
