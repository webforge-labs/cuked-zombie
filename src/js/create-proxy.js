var _ = require('lodash');

module.exports = function(cucumberStep) {

  var runStep = function(step, cucumberScope, args, cucumberCallback) {
    cucumberScope.setStepCallback(cucumberCallback);

    return step.apply(cucumberScope, args);
  };

  var proxy = {};

  var proxyStep = function(keyword) {
    // lets create a proxy/curry that calls the original cucumber step with some additional arguments or properties

    return function(regexp, options, originalStep) {
      if (_.isFunction(options)) {
        originalStep = options;
        options = {};
      }

      if (!options.hasOwnProperty('withCSS')) {
        options.withCSS = false;
      }

      var funcs = this.fn;

      var stepCurry = function() { 
        var args = Array.prototype.slice.call(arguments, 0);
        var cucumberCallback = args[args.length - 1];
        var cucumberScope = this;

        // assign functions from stepDefinitions.fn directly to the scope
        _.assign(cucumberScope, funcs);

        if (options.withCSS) {
          cucumberScope.waitForjQuery(function(jQuery) {
            return runStep(originalStep, cucumberScope, args, cucumberCallback);
          });

        } else {
          return runStep(originalStep, cucumberScope, args, cucumberCallback);
        }
      };

      // we fake cucumber that our dynamic arguments function has the right arguments length
      Object.defineProperty(stepCurry, 'length', {get: function() {
        return originalStep.length;
      }});

      // e.g: that.Then(regexp, stepCode = function() {
      cucumberStep[keyword].call(this, regexp, options, stepCurry);
    };
  };

  proxy.Given = proxyStep('Given');
  proxy.When = proxyStep('When');
  proxy.Then = proxyStep('Then');

  proxy.Before = cucumberStep.Before;
  proxy.After = cucumberStep.After;

  proxy.fn = {};

  return proxy;
};
