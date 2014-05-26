/* globals describe, it */
var expect = require('chai').expect;
var path = require('path');
var cukedZombie = require('../../');
var mockedCucumberStep = {
  Given: function() {},
  Then: function() {},
  When: function() {}
};

describe('cukedZombie: infect', function() {

  it("throws an error if no domain is provided", function() {

    var test = function() {
      cukedZombie.infect(mockedCucumberStep, {
        world: {
          cli: 'not-relevant'
        },
        steps: {
          dir: path.resolve('tests/files/my-blog')
        }
      });
    };

    expect(test).to.throw(/you have to provide a \(base\-\)domain for the world\./);
  });

  it("throws an error if no key for host is provided in domains", function() {

    var test = function() {
      cukedZombie.infect(mockedCucumberStep, {
        world: {
          domains: {
            'some-host': 'staging.my-blog.com'
          },
          cli: 'not-relevant'
        },
        steps: {
          dir: path.resolve('tests/files/my-blog')
        }
      });
    };

    expect(test).to.throw(/you have to provide a \(base\-\)domain for the world\./);
  });

  it("works if domain is provided directly", function() {

    var infected = cukedZombie.infect(mockedCucumberStep, {
        world: {
          domains: {
            'some-host': 'staging.my-blog.com'
          },
          domain: 'staging.my-blog.com',
          cli: 'not-relevant'
        },
        steps: {
          dir: path.resolve('tests/files/my-blog')
        }
      });

    expect(infected).to.be.ok;
  });

  it("works if hostname is provided as domain in keys", function() {

    var infected = cukedZombie.infect(mockedCucumberStep, {
        world: {
          domains: {
            'some-host': 'staging.my-blog.com'
          },
          hostname: 'some-host',
          cli: 'not-relevant'
        },
        steps: {
          dir: path.resolve('tests/files/my-blog')
        }
      });

    expect(infected).to.be.ok;
  });

});