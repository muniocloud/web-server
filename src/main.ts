import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('aa', process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  await app.listen(3000);
}
bootstrap();
