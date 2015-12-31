var logger = require('@the-brain-trust/logger');
var rds = require('./rds');

module.exports = function(grunt) {
  /**
   * Run sync task with the option of using force
   * @param  {Boolean} force  Option of dropping tables first
   * @return {Function}       Returns the function to run
   */
  function sync(force) {
    return function() {
      var done = this.async();

      grunt.log.writeln('syncing schema...');

      rds.sync({
        force: force,
        logging: logger.stream.write
      }).then(function() {
        grunt.log.writeln('schema sync succeeded.');
        done();
      }).catch(function(err){
        grunt.log.writeln('schema sync failed.');
        done(false);
      });
    };
  }

  grunt.initConfig({});

  grunt.registerTask('default', ['sync']);
  grunt.registerTask('sync', 'sync schema.', sync(false));
  grunt.registerTask('sync_force', 'sync schema forcefully.', sync(true));
};

