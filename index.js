var createProxy = require("./src/js/create-proxy");
var createWorld = require("./src/js/create-world");

var that = {

  Zombie: require('zombie'),
  chai: require('chai'),

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
      var stepDefinitions = require(absoluteFile);

      if (typeof(stepDefinitions) !== 'function') {
        throw new Error(file+' does not export a function when required.');
      }

      steps.push(
        that.infectStep(cucumberStep, stepDefinitions, options)
      );
    });

    return steps;
  },

  /**
   * Infects the cucumberStep with the step definitions from `step`
   */
  infectStep: function(cucumberStep, stepDefinitions, options) {
    var proxy = createProxy(cucumberStep, options);

    if (typeof(stepDefinitions) !== 'function') {
      throw new Error(' parameter #2 has to be a step function to infect');
    }

    return stepDefinitions.apply(proxy, options.arguments || []);
  },

  /**
   * Infects the native cucumberStep with the constructor for the World
   *
   * @return the constructor of World
   */
  infectWorld: function(cucumberStep, options) {
    return cucumberStep.World = createWorld(options);
  },

  runCucumber: require("./src/js/run-cucumber")
};

module.exports = that;