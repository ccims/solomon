import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {

  // parse key and SSL certificate to secure server using HTTPS
  const httpsOptions = {
    key: fs.readFileSync('./config/certificate/key.pem'),
    cert: fs.readFileSync('./config/certificate/cert.pem'),
  };

  // parse user for basic auth from file
  const rawData =  fs.readFileSync('./config/credentials/basic-user.json');
  const basicAuthUser = JSON.parse(rawData.toString());
  
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors();
  app.use(basicAuth(basicAuthUser));

  await app.listen(443); // set 80 to directly access from fargate (was 6400)
}
bootstrap();
