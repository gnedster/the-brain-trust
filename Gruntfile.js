module.exports = function(grunt) {
  grunt.initConfig({
    eslint: {
      src: ['.']
    },
    csslint: {
      src: ['**/public/**/*.css']
    }
  });

  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.registerTask('lint', ['eslint', 'csslint']);

};

