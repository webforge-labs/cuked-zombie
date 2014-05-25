module.exports = function(grunt) {
  'use strict';

  grunt.registerTask('cucumber', 'run cucumber from grunt', function() {
    var filter = grunt.option('filter');

    if (!filter) {
      grunt.task.run('cucumberjs:all');
    } else {
      grunt.log.verbose("running cucumber js for "+(filter ? 'features: "'+filter+'"' : 'all features'));
      var search = 'features/**/'+filter+'*.feature';
      var files = grunt.file.expand(search);

      if (files.length === 0) {
        grunt.log.writeln('search: '+search);
        grunt.log.error('no features found for filter: '+filter);
        return 1;
      }

      var config = grunt.config.get('cucumberjs.features');
      config.src = files;
      grunt.config.set('cucumberjs.run', config);

      grunt.task.run('cucumberjs:run');
    }
  });

};