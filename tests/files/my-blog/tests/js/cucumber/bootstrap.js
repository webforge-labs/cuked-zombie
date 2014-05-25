/* globals __dirname */
module.exports = function() {
  var cucumberStep = this;
  var path = require('path');
  var os = require('os');
  var chai = require('chai');
  chai.config.includeStack = true;

  var cukedZombie = require('cuked-zombie');

  var stepCommons = {};

  var infected = cukedZombie.infect(cucumberStep, {
    world: {
      cli: path.join(__dirname, '..', '..', '..', 'bin', 'cli.' +(os.platform() === 'win32' ? 'bat' : 'sh')),
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
      dir: __dirname,
      arguments: [chai.expect, stepCommons]
    }
  });

  infected.World.prototype.init = function() {
    this.env = {};
  };


  this.Before("@mailing", function(callback) {
    this.clearMailSpool(callback);
  });
};
