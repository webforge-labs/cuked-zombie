module.exports = function(grunt) {
  'use strict';

  var runCucumber = require('../src/js/run-cucumber');
  var _ = require('lodash');

  grunt.registerTask('cucumber', 'run cucumber from grunt', function() {
    var filter = grunt.option('filter');
    var tags = grunt.option('tags');
    
    var config = grunt.config.get('cuked-zombie') || {};

    var options = _.merge({
        features: 'features',
        bootstrap: "tests/js/cucumber/bootstrap.js",
        format: "pretty"
      }, 
      config.options || {},
      {
        format: grunt.option('format')
      }
    );

    var cucumberOptions = {
      steps: options.bootstrap,
      format: options.format
    };

    var files;
    if (tags) {
      grunt.log.debug("running cucumber-js for tags: "+tags);
      cucumberOptions.tags = tags;
      files = options.features; // all
        
    } else if (filter) {
      grunt.log.debug("running cucumber-js for "+(filter ? 'features: "'+filter+'"' : 'all features'));

      var search = options.features+'/**/'+filter+'*.feature';
      files = grunt.file.expand(search);

      if (files.length === 0) {
        return grunt.fail.warn('no features found for filter: '+filter+' with pattern: '+search);
      }
    }

    var done = this.async();
    runCucumber(files, cucumberOptions, done);
  });
};