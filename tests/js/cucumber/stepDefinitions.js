/* globals __dirname */

module.exports = function() {
  var cucumberStep = this;
  var path = require('path');
  var _ = require('lodash');

  var chai = require('chai');
  chai.config.includeStack = true;
  chai.use(require('./chai-file-and-directory'));
  var expect = chai.expect;

  this.World = function() {
    this.env = {};
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

  var parseFeatures = function(stdout) {
    var features = [];

    var re = /^Feature:\s*(.*?)$/gm, match;

    while(match = re.exec(stdout)) {
      features.push(match[1]);
    }

    return features;
  };

  var runCucumber = function(cmd, callback) {
    var env = this.env;
    var exec = require('child_process').exec;
    var path = require('path');

    var task = exec('cucumber-js  --no-colors --format=pretty -r tests/js/cucumber/bootstrap.js '+cmd, { cwd: this.env.project.dir }, function(error, stdout, stderr) {
      expect(error, "cucumber produces an error:\n"+stdout+stderr).to.be.null;

      env.cucumberRun = {
        stderr: stderr,
        stdout: stdout
      };
    });

    task.on('close', function (code) {
      env.cucumberRun.exitCode = code;
      env.cucumberRun.features = parseFeatures(env.cucumberRun.stdout);

      callback();
    });
  };

  this.When(/^I execute cucumber with tag "([^"]*)" in the root of the project$/, function(tagString, callback) {
    runCucumber.call(this, '--tags '+tagString, callback);
  });

  this.When(/^I execute cucumber with filter "([^"]*)" in the root of the project$/, function(filter, callback) {
    runCucumber.call(this, 'features/'+filter+'.feature', callback);
  });

  this.Then(/^cucumber has run the feature "([^"]*)" successfully$/, function(featureName, callback) {
    /* globals console:true */
    expect(this).to.have.deep.property('env.cucumberRun');
    var run = this.env.cucumberRun;
    try {
      expect(run, 'cucumberRun not exited correctly').to.have.property('exitCode', 0);
      expect(run, 'cucumberRun result did not match').to.have.property('features').and.to.be.eql([featureName]);
    } catch (assertion) {
      console.log(run);
      throw assertion;
    }

    callback();
  });

  this.Then(/^all cucumber tests are passed$/, function(callback) {
    expect(this).to.have.deep.property('env.cucumberRun.stdout').to.contain('6 steps (6 passed)').and.to.contain('1 scenario (1 passed)');
    callback();
  });
};
