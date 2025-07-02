import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerConfig, AppConfig } from './config/configuration';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // STRATEGY 1: Keep current working setup (Recommended)
  // No global prefix - routes work as /v1/events

  // STRATEGY 2: Alternative with global prefix (for future)
  // app.setGlobalPrefix('api/v1');

  // STRATEGY 3: Advanced Versioning (Alternative - commented out)
  // app.setGlobalPrefix('api');
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  //   prefix: 'v',
  // });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS configuration
  app.enableCors();

  // Swagger configuration (only in development and staging)
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');
  if (!swaggerConfig) {
    throw new Error('Swagger configuration is missing');
  }
  if (swaggerConfig.enabled) {
    const appConfig = configService.get<AppConfig>('app');
    if (!appConfig) {
      throw new Error('App configuration is missing');
    }
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addTag('Events Management', 'Event lifecycle operations')
      .addTag('Reports', 'Analytics and reporting endpoints')
      .addServer(
        `http://localhost:${appConfig.port}/v1`,
        'Development API v1',
      )
      .addServer(
        `http://localhost:${appConfig.port}/v2`,
        'Development API v2 (Future)',
      )
      .addServer('https://api.events.com/v1', 'Production API v1')
      .build();

        const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(swaggerConfig.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });
  }

  const appConfig = configService.get<AppConfig>('app');
  if (!appConfig) {
    throw new Error('App configuration is missing');
  }
  await app.listen(appConfig.port);

  console.log(
    `🚀 Application is running on: http://localhost:${appConfig.port}`,
  );
  console.log(`🌍 Environment: ${appConfig.environment}`);
  console.log(`📡 API Base URL: http://localhost:${appConfig.port}/api/v1`);

  if (swaggerConfig.enabled) {
    console.log(
      `📚 Swagger documentation available at: http://localhost:${appConfig.port}/${swaggerConfig.path}`,
    );
  }
}
void bootstrap();
