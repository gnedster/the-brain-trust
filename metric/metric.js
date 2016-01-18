var _ = require('lodash');
var logger = require('@the-brain-trust/logger');
var rds = require('@the-brain-trust/rds');

/**
 * Persist an event for analytics
 * http://vldb.org/pvldb/vol5/p1771_georgelee_vldb2012.pdf
 * @param  {Object} event            A plain JS object representing some event
 * @param  {String} event.teamId     Slack team id
 * @param  {String} event.channelId  Slack channel id
 * @param  {String} event.userId     Slack user id
 * @param  {String} event.initiator  Object initiating the event
 *                                   {client, server} × {user, app}
 * @param  {String} event.timestamp  Slack timestamp
 * @param  {String} event.name       Name of the event
 * @param  {Object} event.details    JSON object containing pertinent details
 * @return {Promise}
 */
function write(event) {
  return rds.models.Event.create(event)
    .then(function(instance){
      logger.debug('metric written');
      return instance;
    }).catch(function(err){
      logger.error('failed to write event', err);
    });
}

/**
 * Aggregate events for course-grained analytics. Not the most performant,
 * but typically run on an infrequent basis (hourly or daily).
 * @return {Promise} Promise returning the result of Application updates.
 */
function aggregate() {
  return Promise.all([
    rds.models.Application.findAll({
      include: [rds.models.ApplicationPlatformEntity],
      paranoid: false
    }),
    rds.models.Event.findAll()])
    .then(function(result) {
      var applications = _.keyBy(_.map(result[0], function(application) {
        // Reset metric counts
        _.assign(application, {
          messagesReceived: 0,
          messagesSent: 0,
          pageViews: 0,
          authorizations: application.ApplicationPlatformEntities.length
        });

        return application;
      }), 'name');
      var events = result[1];

      _.each(events, function(event) {
        var parts = event.name.split(':');
        var client = parts[0];
        var applicationName = parts[1];
        // var platform = parts[2];
        var component = parts[3];
        // var element = parts[4];
        var action = parts[5];

        if (_.isUndefined(applications[applicationName])) {
          logger.warn(`could not find application (${applicationName})`);
          return;
        }

        switch(client) {
          case 'chat':
            switch(action) {
              case 'command':
              case 'message':
                applications[applicationName].messagesReceived++;
                break;
              case 'reply':
                applications[applicationName].messagesSent++;
                break;
            }
            break;
          case 'web':
            switch(component) {
              case 'page':
                switch(action) {
                  case 'view':
                    applications[applicationName].pageViews++;
                    break;
                }
                break;
            }
            break;
        }
      });

      return Promise.all(_.map(_.values(applications), function(application) {
        return application.save();
      }));
    });
}

module.exports = {
  write: write,
  aggregate: aggregate
};
