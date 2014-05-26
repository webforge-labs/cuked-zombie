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
  var expect = chai.expect;

  this.World = function(callback) {
    this.env = {};

    callback();
  };
  

  this.Given(/^I am using the project "([^"]*)"$/, function(name, callback) {
    var path = require('path');

    var project = {
      name: name,
      dir: path.resolve('./tests/files/'+name),
      getFile: function(relativePath) {
        return path.resolve(project.dir, relativePath);
      },
      getDirectory: function(relativePath) {
        return path.resolve(project.dir, relativePath);
      }
    };

    expect(project.dir).to.be.an.existingDirectory;

    this.env.project = project;
    callback();
  });

  this.Given(/^I have created my step\-definition bootstrap by hand$/, function(callback) {
    expect(this.env.project.getFile('tests/js/cucumber/bootstrap.js')).to.be.an.existingFile;

    callback();
  });

  this.Given(/^I have installed cuked\-zombie with npm$/, function(callback) {
    expect(this.env.project.getDirectory('node_modules/cuked-zombie')).to.be.an.existingDirectory;
    expect(this.env.project.getDirectory('node_modules/grunt-cucumber')).to.be.an.existingDirectory;

    callback();
  });  

  this.When(/^I execute the grunt cucumber task with filter "([^"]*)" in the root of the project$/, function(filter, callback) {
    var env = this.env;
    var exec = require('child_process').exec;
    var grunt = require('grunt');
    var path = require('path');
    var os = require('os');

    var task = exec('grunt cucumber --stack --no-color --filter '+filter, { cwd: this.env.project.dir }, function(error, stdout, stderr) {
      expect(error, "grunt cucumber produces an error:\n"+stdout+stderr).to.be.null;

      env.cucumberRun = {
        stderr: stderr,
        stdout: stdout.replace(/\033\[[0-9;]*m/g, '') // strip ansi until cucumber has a --no-color switch
      };
    });

    task.on('close', function (code) {
      env.cucumberRun.exitCode = code;
      callback();
    });
  });

  this.Then(/^cucumber has run the feature "([^"]*)" successfully$/, function(arg1, callback) {
    expect(this, 'cucumberRun not exited correctly').to.have.deep.property('env.cucumberRun.exitCode', 0);
    

    callback();
  });

  this.Then(/^all cucumber tests are passed$/, function(callback) {
    expect(this).to.have.deep.property('env.cucumberRun.stdout').to.contain('6 steps (6 passed)').and.to.contain('1 scenario (1 passed)');
    callback();
  });
};
