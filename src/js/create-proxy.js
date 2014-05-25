var _ = require('lodash');

module.exports = function(cucumberStep, options) {
  options = _.defaults(options, {
    stackLength: 14
  });

  var proxy = {};
  var proxyStep = function(stepName) {
    return function(regexp, step) {
      cucumberStep[stepName].call(this, regexp, function() { // e.g: that.Then(regexp, function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var cucumberCallback = args[args.length - 1];
        var cucumberScope = this;

        try {
          step.apply(cucumberScope, args);
        } catch (ex) {
          // to make the output better (from zombie) we short the stack  here
          ex.stack = ex.stack.split("\n").slice(0, options.stackLength).join("\n") + "\n (stack was shortened by cuked-zombie)";

          cucumberCallback.fail(ex); // catch every exception (the one from chai and the ones from zombie and convert to failure)
        }
      });
    };
  };

  proxy.Given = proxyStep('Given');
  proxy.When = proxyStep('When');
  proxy.Then = proxyStep('Then');

  return proxy;
};