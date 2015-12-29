module.exports = function(grunt) {
  grunt.initConfig({
    eslint: {
      src: ['.']
    },
    csslint: {
      src: ['web/public/**/*.css']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('gruntify-eslint');

  grunt.registerTask('lint', ['eslint', 'csslint']);
};

