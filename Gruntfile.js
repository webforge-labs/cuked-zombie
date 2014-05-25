/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      libs: {
        src: ['Gruntfile.js', 'src/js/**/*.js', 'tests/js/*.js']
      }
    },

    cucumberjs: {
      all: {
        src: 'features',
        options: {
          steps: "tests/js/cucumber/stepDefinitions.js", // .js is important otherwise cucumber will expand (what we don't want)
          format: "pretty"
        }
      },

      features: {
        src: 'features',
        options: {
          steps: "tests/js/cucumber/stepDefinitions.js", // .js is important otherwise cucumber will expand (what we don't want)
          format: "pretty"
        }
      }
    }
  });

  grunt.loadTasks('src/js/tasks');

  grunt.registerTask('test', ['jshint', 'cucumber']);
};
