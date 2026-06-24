// Sentry must be imported before anything else
import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(AppConfigService);

  app.use(helmet());
  app.enableCors({ origin: config.allowedOrigins, credentials: true });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist:true, transform:true }));
  app.setGlobalPrefix('api/v1');

  if (!config.isProduction) {
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  }

  // ⚠️⚠️⚠️  TEMPORARY — REVIEW BEFORE REAL PUBLIC LAUNCH  ⚠️⚠️⚠️
  // Swagger is currently enabled in production (Railway staging) purely for
  // testing convenience. Before going live with real user data, set
  // ENABLE_SWAGGER=false in Railway's environment variables — no code change
  // or redeploy needed, just flip the env var and restart the service.
  if (config.enableSwagger) {
    const sw = new DocumentBuilder()
      .setTitle('Udyoga Sakha API')
      .setDescription('Sarva Moola Udyoga Sakha — unified employment ecosystem for 11 role types.')
      .setVersion('1.0').addBearerAuth()
      .addTag('Auth').addTag('Users').addTag('Listings')
      .addTag('Profiles').addTag('Market').addTag('Documents').addTag('Health')
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, sw));
  }

  await app.listen(config.port);
  console.log(`\n✦ Udyoga Sakha API → http://localhost:${config.port}`);
  if (!config.isProduction) console.log(`  Swagger      → http://localhost:${config.port}/api/docs`);
}
bootstrap();
