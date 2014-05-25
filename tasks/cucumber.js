module.exports = function(grunt) {
  'use strict';

  grunt.registerTask('cucumber', 'run cucumber from grunt', function() {
    var filter = grunt.option('filter');

    if (!filter) {
      grunt.task.run('cucumberjs:all');
    } else {
      grunt.log.debug("running cucumber js for "+(filter ? 'features: "'+filter+'"' : 'all features'));
      var search = 'features/**/'+filter+'*.feature';
      var files = grunt.file.expand(search);

      if (files.length === 0) {
        grunt.log.writeln('search: '+search);
        return grunt.fail.warn('no features found for filter: '+filter);
      }

      var config = grunt.config.get('cucumberjs.features');
      config.src = files;
      grunt.config.set('cucumberjs.run', config);

      grunt.task.run('cucumberjs:run');
    }
  });

};