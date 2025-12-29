export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://s3.fr-par.scw.cloud',
            'strapi-assets.s3.fr-par.scw.cloud',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'https://s3.fr-par.scw.cloud',
            'strapi-assets.s3.fr-par.scw.cloud',
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
