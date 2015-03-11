module.exports = function(options) {
  var Browser = require('zombie');
  var chai = require('chai');
  var CSSTest = require('css-tester')(chai);
  var expect = chai.expect;
  var execFile = require('child_process').execFile;
  var os = require('os');
  var _ = require('lodash');

  options = _.defaults(options, {
    hostname: os.hostname(),
    domains: {},
    debug: false,
    browser: {}
  });

  if (!options.domain && options.domains[options.hostname]) {
    options.domain = options.domains[options.hostname];
  }

  if (!options.domain) {
    throw new Error('you have to provide a (base-)domain for the world. No key "'+options.hostname+'" found for a domain in '+require('stringify-object')(options.domains, { indent: '  '}));
  }

  return function World(callback) {
    var that = this;

    this.cucumberCallback = undefined;
    this.setStepCallback = function(cucumberCallback) {
      that.cucumberCallback = cucumberCallback;
    };

    this.util = require('./zombie-utils')(that);

    if (this.init) {
      this.init.call(this, Browser);
    }

    this.debug = {};
    this.debug.log = function() {
      /* globals console */
      (console.log).apply(this, arguments);
    };

    var browserOptions = _.defaults(options.browser, {
      site: 'http://'+options.domain,
      debug: options.debug,
      headers: {
        'X-Environment-In-Tests': 'from-zombie'
      },
      waitDuration: 7000
    });

    if (options.debug) {
      that.debug.log('browserOptions:', browserOptions);
    }

    this.browser = new Browser(browserOptions);

    var debug = require('debug')('requests');
    var fixturesDebug = require('debug')('fixtures');

    if (options.debug) {
      this.browser.on("response", function(request, response) {
        debug(request);
        debug(response);
      });
    }

    this.browser.on("opened", function(window) {
      // make Raphael run in zombie without quitting silently
      window.SVGAngle = {};
      window.window.SVGAngle = {};
    });
    
    _.each(options.cookies || {}, function(cookie) {
      that.browser.cookies.set(_.defaults(cookie, { domain: options.domain}));
    });

    this.css = function(selector) {
      if (!that.browser.window.jQuery) {
        throw new Error('cannot css() because jQuery is not defined. Maybe you used this.css and forgot withCSS parameter after callback?');
      }

      return new CSSTest(that.browser.window.jQuery, selector);
    };

    this.visit = function(url, callback, cucumberCallback) {
      that.browser.visit(url, function(error) {
        /*
        if (error && error.filename === 'http://www.youtube.com/embed/tW2WGr--jy4:script') {
          that.debug.log('youtube error ignored');

          // just continue
          that.browser.wait(function() {
            callback.call(that, that.browser);
          });
        } else
        */
        if (error) {
          if (error.toString().search('/Server returned status code 500/')) {
            that.debug.log(that.browser.html());
          }

          if (cucumberCallback) {
            cucumberCallback.fail(error);
          } else if (that.cucumberCallback) {
            that.cucumberCallback.fail(error);
          } else {
            throw error;
          }
        } else {
          callback.call(that, that.browser);
        }
      });
    };

    this.waitForjQuery = function(callback) {
      if (!that.browser.window) {
        throw new Error('cannot wait for jQuery, that.browser.window is not defined. Did you forget to visit a page before waiting for jQuery?');
      }

      that.browser.wait(
        function() {
          return that.browser.window.jQuery !== undefined;
        },
        function() {
          if (!that.browser.window) {
            throw new Error('cannot wait for jQuery, that.browser.window is not defined (after waiting)');
          }

          if (!that.browser.window.jQuery) {
            throw new Error('timed out while waiting for jQuery');
          }

          that.registerjQuery();
          callback.call(that, that.browser.window.jQuery);
        }
      );
    };

    this.requirejQuery = function(callback) {
      //that.browser.evaluate("window.require(['jquery']);");
      this.waitForjQuery(callback);
    };

    // should be called if for example a button has changed the site
    this.pageHasChanged = function(callback) {
      that.registerjQuery();
      callback.call(that);
    };

    this.getjQuery = function() {
      return that.browser.window.jQuery;
    };

    this.koContext = function($element) {
      var ko = that.browser.window.require('knockout');
      var context = ko.contextFor($element.jquery ? $element.get(0) : $element);

      expect(context, 'context from element: '+$element).to.be.ok;

      return context;
    };

    this.koData = function($element) {
      return that.koContext($element)['$data'];
    };

    this.registerjQuery = function() {
      if (that.browser.window.jQuery) {
        that.jQuery = that.browser.window.jQuery;

        that.ajaxRequests = [];

        that.jQuery(that.browser.document).ajaxSend( function(event, jqXHR, ajaxOptions) {
          that.ajaxRequests.push(ajaxOptions);
        });
      }
    };

    this.visitPage = function(path, callback, cucumberCallback) {
      return that.visit(path, function() {
        that.pageHasChanged(function() {
          callback.call(that, that.browser);
        });
      }, cucumberCallback);
    };

    this.getLastAjaxRequest = function() {
      expect(that.ajaxRequests, 'list of made ajax Requests').to.be.ok.and.not.to.have.length(0);

      var lastRequest = this.ajaxRequests[this.ajaxRequests.length - 1];

      return lastRequest;
    };

    // expects something for the last ajax request done
    // .data an object, .url a string
    this.expectAjaxRequest = function(exp) {
      var lastRequest = this.getLastAjaxRequest();

      expect(lastRequest, 'lastAjaxRequest').to.have.property('url', exp.url);
      expect(lastRequest, 'lastAjaxRequest').to.have.property('data');
      expect(JSON.parse(lastRequest.data), 'lastAjaxRequest.data').to.be.eql(exp.data);
    };

    this.executeDQL = function(dql, parameters, callback, cucumberCallback) {
      /* globals Buffer */
      var jsonParameters = JSON.stringify(parameters);
      var encodedParameters = new Buffer(jsonParameters).toString('base64');

      execFile(options.cli, ["db:dql", "--base64", dql, encodedParameters], function(error, stdout, stderr) {
        if (error) {
          console.log(stderr, stdout);
          expect(error).to.be.undefined;
        }

        var result = JSON.parse(stdout);

        if (cucumberCallback) {
          try {
            callback.call(that, result, dql);

            cucumberCallback();
          } catch (exc) {
            cucumberCallback.fail(exc);
          }
        } else {
          callback.call(that, result, dql);
        }
      });
    };

    this.retrieveMailSpool = function(callback, cucumberCallback) {
      execFile(options.cli, ["mail:spool"], function(error, stdout, stderr) {
        if (error) {
          that.debug.log(stderr, stdout);
          throw error;
        }

        var result = JSON.parse(stdout);


        if (cucumberCallback) {
          try {
            callback.call(that, result);

            cucumberCallback();
          } catch (exc) {
            cucumberCallback.fail(exc);
          }
        } else {
          callback.call(that, result);
        }
      });
    };

    this.clearMailSpool = function(callback) {
      execFile(options.cli, ["mail:spool", "--clear"], function(error, stdout, stderr) {
        if (error) {
          that.debug.log(stderr, stdout);
          throw error;
        }

        callback.call(that);
      });
    };

    this.loadFixture = function(name, callback) {
      execFile(options.cli, ["db:fixture", name], function(error, stdout, stderr) {
        if (error) {
          that.debug.log(stderr, stdout);
          throw error;
        }

        callback.call(that);
      });
    };

    this.loadFixtureParts = function(partsText, callback) {
      fixturesDebug('loading fixture-parts:');
      fixturesDebug(partsText);

      partsText = partsText.replace(/\r?\n/g, '_');

      execFile(options.cli, ["db:fixture-parts", partsText, '--divider=_'], function(error, stdout, stderr) {
        if (error) {
          fixturesDebug(stderr, stdout);
          throw error;
        }

        if (options.debug) {
          fixturesDebug('fixture parts debug:');
          fixturesDebug(stdout);
        }

        callback.call(that);
      });
    };

    this.cli = function(parameters, callback) {
      if (options.debug) {
        that.debug.log('call cli command');
        that.debug.log(parameters);
      }

      execFile(options.cli, parameters, function(error, stdout, stderr) {
        if (error) {
          that.debug.log(stderr, stdout);
          throw error;
        }

        callback.call(that, stdout, stderr);
      });
    };

    callback(); // tell Cucumber we're finished and to use 'this' as the world instance
  };
};
