module.exports = function(grunt) {
  grunt.initConfig({
    forever: {
      oauthServer: {
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
    'forever:oauthServer:start',
    'mochaTest',
    'forever:oauthServer:stop'
    ]
  );
};