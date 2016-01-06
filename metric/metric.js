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
      logger.debug(instance);
      return instance;
    }).catch(function(err){
      logger.error('failed to write event', err);
    });
}

module.exports = {
  write: write
};
