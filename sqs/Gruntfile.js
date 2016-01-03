module.exports = function(grunt) {
  grunt.initConfig({
    exec: {
      start_fake_sqs: {
        command: 'fake_sqs'
      }
    },
    mochaTest: {
      src: ['./test/*.js']
    }
  });

  grunt.initConfig({});

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', 'run tests.',
    ['exec:start_fake_sqs', 'mochaTest']
    );
};



