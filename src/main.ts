import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOriginEnv = process.env.CORS_ORIGIN?.trim();
  const allowAllOrigins = !corsOriginEnv || corsOriginEnv === '*';
  const corsOrigins = new Set(
    (corsOriginEnv ?? '')
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean),
  );

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (allowAllOrigins || !requestOrigin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = requestOrigin.replace(/\/$/, '');
      callback(null, corsOrigins.has(normalizedOrigin));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    optionsSuccessStatus: 204,
  });

  // Validation globale pour tous les DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger pour tester l'API rapidement.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('OMS API')
    .setDescription('Documentation API OMS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
