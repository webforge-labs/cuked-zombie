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
    debug: false
  });

  if (!options.domain && options.domains[options.hostname]) {
    options.domain = options.domains[options.hostname];
  }

  if (!options.domain) {
    throw new Error('you have to provide a (base-)domain for the world. No key "'+options.hostname+'" found for a domain in '+require('stringify-object')(options.domains, { indent: '  '}));
  }

  return function World(callback) {
    var that = this;

    this.util = require('./zombie-utils')(that);

    if (this.init) {
      this.init.call(this);
    }

    this.browser = new Browser({
      site: 'http://'+options.domain,
      debug: options.debug,
      headers: {
        'X-Environment-In-Tests': 'from-zombie'
      },
      maxWait: 7
    });

    _.each(options.cookies || {}, function(cookie) {
      that.browser.cookies.set(_.defaults(cookie, { domain: options.domain}));
    });

    this.debug = {};
    this.debug.log = function() {
      /* globals console */
      (console.log).apply(this, arguments);
    };

    this.css = function(selector) {
      if (!that.browser.window.jQuery) {
        throw new Error('cannot css() because jQuery is not defined');
      }

      return new CSSTest(that.browser.window.jQuery, selector);
    };

    this.visit = function(url, callback) {
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
          throw error;
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
      var context = ko.contextFor($element.get(0));

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

    this.visitPage = function(path, callback) {
      return that.visit(path, function() {
        that.pageHasChanged(function() {
          callback.call(that, that.browser);
        });
      });
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
      execFile(options.cli, ["db:dql", dql, JSON.stringify(parameters)], function(error, stdout, stderr) {
        if (error) {
          console.log(stderr, stdout);
          expect(error).to.be.undefined;
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
      if (options.debug) {
        that.debug.log('loading fixture-parts:');
        that.debug.log(partsText);
      }

      partsText = partsText.replace(/\r?\n/g, '_');

      execFile(options.cli, ["db:fixture-parts", partsText, '--divider=_'], function(error, stdout, stderr) {
        if (error) {
          that.debug.log(stderr, stdout);
          throw error;
        }

        if (options.debug) {
          that.debug.log('fixture parts debug:');
          that.debug.log(stdout);
        }

        callback.call(that);
      });
    };

    callback(); // tell Cucumber we're finished and to use 'this' as the world instance
  };
};
