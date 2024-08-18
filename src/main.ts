import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const origin = configService.get<string>('CORS_ORIGIN');
  
  app.enableCors({
    origin,
    credentials: true
  });
  await app.listen(8000);
}
bootstrap();
