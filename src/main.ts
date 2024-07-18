import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.use(helmet());
  await app.listen(process.env.PORT || 3000);
  const url = await app.getUrl();
  console.log(`Listening on ${url}`);
}
bootstrap();
