import { APP_CONFIG } from '@/config/app.config';
import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { apiReference } from '@scalar/express-api-reference';
import type { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

export function setupApiDocs(app: Application, registries: OpenAPIRegistry[]) {
  const registry = new OpenAPIRegistry(registries);

  //register security schemes
  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  registry.registerComponent('securitySchemes', 'cookieAuth', {
    type: 'apiKey',
    in: 'cookie',
    name: APP_CONFIG.REFRESH_COOKIE_NAME,
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  const openApiDocument = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: APP_CONFIG.APP_VERSION,
      title: APP_CONFIG.APP_NAME,
      description: APP_CONFIG.APP_DESCRIPTION,
    },
    externalDocs: {
      description: 'View the raw OpenAPI spec in JSON format',
      url: '/docs.json',
    },
  });

  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get('/', (_, res) => {
    res.redirect('/reference');
  });

  app.get('/docs.json', (_, res) => {
    res.json(openApiDocument);
  });

  app.use(
    '/reference',
    // (_, res, next) => {
    //   res.setHeader(
    //     'Content-Security-Policy',
    //     "script-src 'self' https://cdn.jsdelivr.net;"
    //   );
    //   next();
    // },
    apiReference({
      theme: 'elysiajs',
      layout: 'classic',
      defaultHttpClient: {
        targetKey: 'node',
        clientKey: 'axios',
      },

      favicon: '💰',
      spec: {
        url: '/docs.json',
      },
    })
  );
}
