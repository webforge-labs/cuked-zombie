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
      domain: 'staging-my-blog.com', // hardcode this for travis-ci
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
