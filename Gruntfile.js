/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      libs: {
        src: ['Gruntfile.js', 'src/js/**/*.js', 'tests/js/**/*.js']
      }
    },

    simplemocha: {
      options: {
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },

      all: { src: ['tests/js/**/*Test.js'] },
    }

  });

  // these are only the unit tests. use npm test for the full testsuite!
  grunt.registerTask('unittest', ['jshint', 'simplemocha:all']);
};