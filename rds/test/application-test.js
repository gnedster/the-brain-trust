/**
 * Add tests for the rds module.
 */
var assert = require('assert');
var rds = require('../rds');

describe('Application', function(){
  var application = rds.models.Application.build({
      name: 'weatherman'
    });

  it('should provide path', function(done){
    assert.equal(application.getPath(), '/applications/weatherman');
    done();
  });

  it('should provide authorize path', function(done){
    assert.equal(application.getAuthorizePath('telegram', '5123213'),
      '/applications/weatherman/telegram/add?state=5123213');
    done();
  });
});
