export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('SCALEWAY_ACCESS_KEY_ID'),
            secretAccessKey: env('SCALEWAY_SECRET_ACCESS_KEY'),
          },
          region: env('SCALEWAY_REGION', 'fr-par'),
          endpoint: env('SCALEWAY_ENDPOINT', 'https://s3.fr-par.scw.cloud'),
        },
        params: {
          Bucket: env('SCALEWAY_BUCKET'),
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
