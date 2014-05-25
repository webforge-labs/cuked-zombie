module.exports = function() {
  var that = this;
  var chai = require('chai');
  var _ = require('lodash');

  this.World = require("./world.js").World;

  chai.config.includeStack = true;

  var proxy = {};
  var stackLength = 14;

  var proxyStep = function(stepName) {
    return function(regexp, step) {
      that[stepName].call(this, regexp, function() { // e.g: that.Then(regexp, function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var cucumberCallback = args[args.length - 1];
        var cucumberScope = this;

        args.push(cucumberScope.jQuery);

        try {
          step.apply(cucumberScope, args);
        } catch (ex) {
          // to make the output better (from zombie) we short the stack  here
          ex.stack = ex.stack.split("\n").slice(0, stackLength).join("\n") + "\n (stack was shortened by stepDefinitions)";

          cucumberCallback.fail(ex); // catch every exception (the one from chai and the ones from zombie and convert to failure)

        }
      });
    };
  };

  proxy.Given = proxyStep('Given');
  proxy.When = proxyStep('When');
  proxy.Then = proxyStep('Then');

  var commons = {
  };

  require('./stepDefinitions/unsorted-step-definitions').call(proxy, chai, commons);
  require('./stepDefinitions/login-step-definitions').call(proxy, chai, commons);
  require('./stepDefinitions/member-step-definitions').call(proxy, chai, commons);
  require('./stepDefinitions/registration-step-definitions').call(proxy, chai, commons);
  require('./stepDefinitions/cms-step-definitions').call(proxy, chai, commons);
  require('./stepDefinitions/news-step-definitions').call(proxy, chai, commons);
  require('./stepDefinitions/project-manager-step-definitions').call(proxy, chai, commons);

  this.Before("@mailing", function(callback) {
    this.clearMailSpool(callback);
  });

};
