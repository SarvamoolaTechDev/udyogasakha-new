"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Sentry must be imported before anything else
require("./instrument");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const app_config_service_1 = require("./config/app-config.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(app_config_service_1.AppConfigService);
    app.use((0, helmet_1.default)());
    app.enableCors({ origin: config.allowedOrigins, credentials: true });
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    if (!config.isProduction) {
        app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    }
    // ⚠️⚠️⚠️  TEMPORARY — REVIEW BEFORE REAL PUBLIC LAUNCH  ⚠️⚠️⚠️
    // Swagger is currently enabled in production (Railway staging) purely for
    // testing convenience. Before going live with real user data, set
    // ENABLE_SWAGGER=false in Railway's environment variables — no code change
    // or redeploy needed, just flip the env var and restart the service.
    if (config.enableSwagger) {
        const sw = new swagger_1.DocumentBuilder()
            .setTitle('Udyoga Sakha API')
            .setDescription('Sarva Moola Udyoga Sakha — unified employment ecosystem for 11 role types.')
            .setVersion('1.0').addBearerAuth()
            .addTag('Auth').addTag('Users').addTag('Listings')
            .addTag('Profiles').addTag('Market').addTag('Documents').addTag('Health')
            .build();
        swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, sw));
    }
    await app.listen(config.port);
    console.log(`\n✦ Udyoga Sakha API → http://localhost:${config.port}`);
    if (!config.isProduction)
        console.log(`  Swagger      → http://localhost:${config.port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map