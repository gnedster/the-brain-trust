module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['lib/**/*.js', 'models/**/*.js', 'public/**/*.js', '*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint']);
};