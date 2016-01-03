module.exports = function(grunt) {
  const fakeSqsPidFile = './tmp/fake_sqs.pid';

  grunt.initConfig({
    exec: {
      bundle: {
        command: 'bundle'
      },
      start_fake_sqs: {
        command: 'fake_sqs -d -P ' + fakeSqsPidFile
      }
    },
    kill: {
      fake_sqs: {
        src: [ fakeSqsPidFile ]
      }
    },
    mochaTest: {
      src: ['./test/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-kill');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', 'run tests.',
    ['exec:bundle',
     'exec:start_fake_sqs',
     'mochaTest',
     'kill:fake_sqs'
    ]
    );
};



