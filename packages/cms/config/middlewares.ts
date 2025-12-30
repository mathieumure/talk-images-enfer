export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http://localhost:4566'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'http://localhost:4566',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'http://localhost:4566',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
