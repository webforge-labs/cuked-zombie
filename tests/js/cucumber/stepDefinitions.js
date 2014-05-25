/* globals __dirname */

module.exports = function() {
  var cucumberStep = this;
  var path = require('path');
  var os = require('os');
  var _ = require('lodash');
  var glob = require('glob');
  var chai = require('chai');
  chai.config.includeStack = true;

  chai.use(require('./chai-file-and-directory'));

  var cukedZombie = require('../../../');

  var World = cukedZombie.infectWorld(cucumberStep, {
    cli: [__dirname, '..', '..', '..', 'bin', 'cli.' +(os.platform() === 'win32' ? 'bat' : 'sh')].join(path.sep),
    domains: {
      'pegasus.ps-webforge.net': 'ssc-testing.ps-webforge.com',
      'psc-laptop': 'ssc.laptop.ps-webforge.net',
      'psc-desktop': 'ssc.desktop.ps-webforge.net',
      'addorange-macbook': 'ssc.dev.192.168.2.222.xip.io'    
    },
    cookies: [{
      name: 'staging_access',
      value: 'tokenU1V2pUK'
    }]
  });

  World.prototype.init = function() {
    this.env = {};
  };

  var commons = {};

  _.each(glob.sync('./stepDefinitions/*step-definitions.js', { cwd: __dirname }), function(file) {
    cukedZombie.infectStep(cucumberStep, require(file), { arguments: [chai.expect, commons, chai] });
  });

  this.Before("@mailing", function(callback) {
    this.clearMailSpool(callback);
  });
};
