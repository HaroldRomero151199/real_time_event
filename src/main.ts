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
      .addTag('Events Management')
      .addServer(`http://localhost:${appConfig.port}`, 'Development server')
      .addServer(`http://localhost:${appConfig.port}`, 'Staging server')
      .addServer('https://api.events.com', 'Production server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
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

  if (swaggerConfig.enabled) {
    console.log(
      `📚 Swagger documentation available at: http://localhost:${appConfig.port}/${swaggerConfig.path}`,
    );
  }
}
void bootstrap();
