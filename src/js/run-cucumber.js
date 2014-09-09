/* globals process */
module.exports = function (files, options, done) {
  var _ = require('lodash');

  var args = ['node', 'node_modules/.bin/cucumber-js', '-f', options.format];

  if (! _.isEmpty(files)) {
    args = args.concat(files);
  }

  if (! _.isEmpty(options.steps)) {
    args.push('-r');
    args.push(options.steps);
  }

  if (! _.isEmpty(options.tags)) {
    args.push('-t');
    args.push(options.tags);
  }

  var callback = function(succeeded) {
    // flush older versions of node
    var flushed = false;
    process.stdout.on('drain', function() {
      if (flushed) {
        done(succeeded);
      }
    });

    if (process.stdout.write("")) {
      done(succeeded);
    } else {
      flushed = true;
    }
  };

  require('cucumber').Cli(args).run(callback);
};