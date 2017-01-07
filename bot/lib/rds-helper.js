var _ = require('lodash');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

/**
 * Get ApplicationPlatformEntities with names
 * @param  {String} platformName    Name of platform
 * @param  {String} applicationName Name of application
 * @return {Promise}                A Promise containing a number of
 *                                  ApplicationPlatformEntity objects
 */
function getApplicationPlatformEntities(platformName, applicationName) {
  return Promise.all([
    rds.models.Platform.findOne({
      where: {
        name: platformName
      }
    }),
    rds.models.Application.findOne({
      where: {
        name: applicationName
      }
    })])
    .then(function(results) {
      var platform = results[0];
      var application = results[1];
      if (platform instanceof rds.models.Platform.Instance &&
        application instanceof rds.models.Application.Instance) {

        return rds.models.ApplicationPlatformEntity.findAll({
          where: {
            application_id : application.id,
            platform_id: platform.id
          }
        });
      } else {
        if (_.isNull(platform)) {
          logger.warn('no platform with name', platformName);
        }

        if (_.isNull(application)) {
          logger.warn('no application with name', applicationName);
        }

        return Promise.resolve([]);
      }
    });
}

module.exports = {
  getApplicationPlatformEntities: getApplicationPlatformEntities
};
