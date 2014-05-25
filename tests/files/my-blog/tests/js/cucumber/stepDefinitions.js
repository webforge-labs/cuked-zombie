/* globals __dirname */

module.exports = function() {
  var cucumberStep = this;
  var path = require('path');
  var os = require('os');
  var _ = require('lodash');
  var glob = require('glob');
  var chai = require('chai');
  chai.config.includeStack = true;

  var cukedZombie = require('cuked-zombie');

  var infected = cukedZombie.infect(cucumberStep, {
    world: {
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
    },
    steps: {
      cwd: __dirname,
      files: './stepDefinitions/database-step-definitions'
    }
  });

  infected.World.prototype.init = function() {
    this.env = {};
  };

  var commons = {};


  this.Before("@mailing", function(callback) {
    this.clearMailSpool(callback);
  });
};
