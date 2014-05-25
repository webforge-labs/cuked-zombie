/* globals describe, it */
var expect = require('chai').expect;

var cukedZombie = require('../../');
var mockedCucumberStep = {
  Given: function() {},
  Then: function() {},
  When: function() {}
};

describe('cukedZombie: infectSteps', function() {

  it("throws an error if an empty step file is used", function() {
    var path = require('path');

    var test = function() {
      cukedZombie.infectSteps(mockedCucumberStep, {
        dir: path.resolve('tests/files/empty-step-files')  // cwd: dirname(Gruntfile.js)
      });
    };

    expect(test).to.throw(/.*empty\-step\-definitions\.js does not export a function when required/);
  });

});