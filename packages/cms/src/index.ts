export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Configure public permissions for upload plugin
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        strapi.log.warn('Public role not found');
        return;
      }

      // Get all permissions for the public role related to upload
      const allPermissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({
          where: { role: publicRole.id },
        });

      // Filter upload permissions we want to enable
      const uploadPermissionsToEnable = allPermissions.filter(
        (perm: any) =>
          perm.action.includes('upload') &&
          (perm.action.includes('find') || perm.action.includes('findOne'))
      );

      // Enable them
      for (const permission of uploadPermissionsToEnable) {
        if (!permission.enabled) {
          await strapi.query('plugin::users-permissions.permission').update({
            where: { id: permission.id },
            data: { enabled: true },
          });
          strapi.log.info(`✅ Enabled public permission: ${permission.action}`);
        }
      }

      strapi.log.info('✅ Public upload permissions configured successfully');
    } catch (error) {
      strapi.log.error('Error configuring public upload permissions:', error);
    }
  },
};
