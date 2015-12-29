module.exports = function(grunt) {
  grunt.initConfig({
    forever: {
      oauth_server: {
        options: {
          index: './test/lib/fake-oauth.js'
        }
      }
    },
    mochaTest: {
      src: ['./test/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-forever');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('test',[
    'forever:oauth_server:start',
    'mochaTest',
    'forever:oauth_server:stop'
    ]
  );
};