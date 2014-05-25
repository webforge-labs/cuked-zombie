/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('cuked-zombie');

  grunt.initConfig({
    cucumberjs: {
      // config for all features when called with: `grunt cucumber`
      all: {
        src: 'features',
        options: {
          steps: "tests/js/cucumber/bootstrap.js", // .js is important otherwise cucumber will expand (what we don't want)
          format: "pretty"
        }
      },

      // config for single features when called with `grunt --filter some-feature`
      features: {
        src: 'features',
        options: {
          steps: "tests/js/cucumber/bootstrap.js", // .js is important otherwise cucumber will expand (what we don't want)
          format: "pretty"
        }
      }
    }
  });
};
