import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Movie Database API')
    .setDescription('API documentation for the Movie Database application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 9000;
  if (isNaN(port)) {
    console.error('Invalid PORT environment variable. Using default port 9000.');
    await app.listen(9000);
  } else {
    await app.listen(port);
  }
}
bootstrap();
