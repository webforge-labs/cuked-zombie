var _ = require('lodash');

module.exports = function(cucumberStep, options) {
  options = _.defaults(options, {
    stackLength: 14
  });

  var runStep = function(step, cucumberScope, args, cucumberCallback) {
    try {
      return step.apply(cucumberScope, args);

    } catch (ex) {
      // to make the output better (from zombie) we short the stack  here
      ex.stack = ex.stack.split("\n").slice(0, options.stackLength).join("\n") + "\n (stack was shortened by cuked-zombie)";

      cucumberCallback.fail(ex); // catch every exception (the one from chai and the ones from zombie and convert to failure)
    }
  };

  var proxy = {};
  var proxyStep = function(stepName) {
    return function(regexp, step) {
      var stepString = step.toString().replace(/[\r\n]*/, ''); // ignore multiline arguments
      var withCSS = stepString.match(/^\s*function\s*\((.*?)withCSS\s*\)/); 

      cucumberStep[stepName].call(this, regexp, function() { // e.g: that.Then(regexp, function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var cucumberCallback = args[args.length - 1];
        var cucumberScope = this;

        if (withCSS) {
          cucumberScope.waitForjQuery(function(jQuery) {
            return runStep(step, cucumberScope, args, cucumberCallback);
          });

        } else {
          return runStep(step, cucumberScope, args, cucumberCallback);
        }
      });
    };
  };

  proxy.Given = proxyStep('Given');
  proxy.When = proxyStep('When');
  proxy.Then = proxyStep('Then');

  return proxy;
};
