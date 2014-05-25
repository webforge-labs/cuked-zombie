var createProxy = require("./src/js/create-proxy");
var createWorld = require("./src/js/create-world");

var that = {

  infect: function(cucumberStep, options) {
    var infected = {};

    infected.World = that.infectWorld(cucumberStep, options.world);

    infected.steps = that.infectSteps(cucumberStep, options.steps);

    return infected;
  },

  infectSteps: function(cucumberStep, options) {
    var _ = require('lodash');
    var glob = require('glob');
    var path = require('path');

    var steps = [];

    _.each(glob.sync('*step-definitions.js', { cwd: options.dir }), function(file) {
      var absoluteFile = path.resolve(options.dir, file);
      var step = require(absoluteFile);

      if (typeof(step) !== 'function') {
        throw new Error(file+' does not export a function when required.');
      }

      steps.push(
        that.infectStep(cucumberStep, step, options)
      );
    });

    return steps;
  },

  /**
   * Infects the cucumberStep with the step definitions from `step`
   */
  infectStep: function(cucumberStep, step, options) {
    var proxy = createProxy(cucumberStep, options);

    if (typeof(step) !== 'function') {
      throw new Error(' parameter #2 has to be a step function to infect');
    }

    return step.apply(proxy, options.arguments || []);
  },

  /**
   * Infects the native cucumberStep with the constructor for the World
   *
   * @return the constructor of World
   */
  infectWorld: function(cucumberStep, options) {
    return cucumberStep.World = createWorld(options);
  }
};

module.exports = that;