import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {


  // parse key and SSL certificate to secure server when using HTTPS
  const httpsOptions = {
    key: fs.readFileSync('./config/certificate/key.pem'),
    cert: fs.readFileSync('./config/certificate/cert.pem'),
  };

  // parse user for basic auth from file in the case of using HTTPS
  const rawData =  fs.readFileSync('./config/credentials/basic-user.json');
  const basicAuthUser = JSON.parse(rawData.toString());
  
  let app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  const configService = app.get(ConfigService);
  const httpsEnabled = configService.get('HTTPS_ENABLED');


  if (httpsEnabled === 'true'){
    app.use(basicAuth(basicAuthUser));
    app.enableCors();
    console.log('Solomon backend running using HTTPS (Port 443)...')
    await app.listen(443); 
  } else {
    // a bit hacky solution: create new app instance without the httpsOptions
    app = await NestFactory.create(AppModule)
    app.enableCors();
    console.log('Solomon backend running using HTTP (Port 6400)...')
    await app.listen(6400);
  }

}
bootstrap();


