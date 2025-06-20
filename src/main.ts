import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Strip properties that don't have decorators
    forbidNonWhitelisted: true,   // Throw error if non-whitelisted properties are present
    transform: true,              // Transform payloads to be objects typed according to their DTO classes
    transformOptions: {
      enableImplicitConversion: true, // Automatically transform primitive types
    },
  }));
  app.use(
    '/stripe/webhook',
    express.raw({ type: 'application/json' })
  );
  app.use(express.json());

  // Set up EJS
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(process.env.PORT ?? 3015);
}
bootstrap();
