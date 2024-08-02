export interface TTSProvider {
  textToSpeech(text: string): Promise<Buffer>;
}
