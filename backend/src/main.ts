import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import { Swagger } from './common/config/swagger';
import { ValidationPipe } from '@nestjs/common';
// import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());

  // app.use(bodyParser.json());

  // Cho phép origin từ https://bookingonline.vercel.app
  app.enableCors();


  Swagger.build(app);
  await app.listen(Number(process.env.PORT) || 9000);
}
bootstrap();
