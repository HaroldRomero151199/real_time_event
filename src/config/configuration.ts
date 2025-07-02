export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfig {
  port: number;
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
}

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  path: string;
  enabled: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  swagger: SwaggerConfig;
  jwt: JwtConfig;
}

export default (): Config => {
  const environment = process.env.NODE_ENV || 'development';

  return {
    app: {
      port: parseInt(process.env.PORT || '3000', 10),
      environment,
      isDevelopment: environment === 'development',
      isProduction: environment === 'production',
      isStaging: environment === 'staging',
    },
    database: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://events_user:events_password@localhost:5433/events_db',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USERNAME || 'events_user',
      password: process.env.DB_PASSWORD || 'events_password',
      database: process.env.DB_NAME || 'events_db',
    },
    swagger: {
      title: process.env.SWAGGER_TITLE || 'Real-Time Event Manager API',
      description:
        process.env.SWAGGER_DESCRIPTION ||
        'A comprehensive API for managing events in a convention center',
      version: process.env.SWAGGER_VERSION || '1.0',
      path: process.env.SWAGGER_PATH || 'api',
      enabled: process.env.SWAGGER_ENABLED !== 'false',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
  };
};
