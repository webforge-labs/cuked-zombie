# cuked-zombie [![Build Status](https://travis-ci.org/webforge-labs/cuked-zombie.svg?branch=master)](https://travis-ci.org/webforge-labs/cuked-zombie)

Use cucumber and zombie in your acceptance tests

[Cucumber](https://github.com/cucumber/cucumber-js) is the Javascript reference-implementation for [Behaviour Driven Development](http://cukes.info/). Cucumber allows you to write acceptance tests at a higher abstraction level than unit tests.
[Zombie](http://zombie.labnotes.org/) is a headless browser written in node, based on Contextify and JSDOM.

Combined they are the best available system to acceptance test your web-application in a browser.

## features

cuked-zombie bridges the small gap between this libraries. It provides an api to infect your native cucumber steps. Infected cucumber steps have new (zombie-)features:

  - chai exceptions (and other) will be automatically converted to cucumber failures
  - you can pass arguments to your infected step definitions
  - a bunch of tools that extend the behaviour of zombie (visiting Pages, sending Cookies, using jQuery from the tested site, etc)
  - an easy integration with [CSSTester](https://github.com/webforge-labs/css-tester)
  - the stack trace from assertions is shortened

other features:

  - a simple task to run all or just single cucumber steps, filter by expression and filter by tags
  - some convenient functions to manage different hosts your testing environment runs on

## installation

[![NPM](https://nodei.co/npm/cuked-zombie.png?downloads=true)](https://www.npmjs.org/package/cuked-zombie)

```
npm install cuked-zombie
```
(this will install Zombie and cucumber-js as well)

## Usage

To use cucumber with zombie you need to infect your step definitions and create an infected world (a world that knows how to invoke zombie(s)).

1. create a step definitions bootstrap and use it as the only stepDefinition in cucumber
2. create your infected steps (they are compatible to native cucumber steps)
3. run cucumber with the bootstrap

*For this example* it is assumed that your features are stored in `features/something.feature`. Your infected step definitions should be stored in files grouped by domain in: `tests/js/cucumber/domain-step-definitions.js`. For example: `tests/js/cucumber/database-step-definitions.js` includes all steps dealing with database stuff. Have a look at [tests/files/my-blog](https://github.com/webforge-labs/cuked-zombie/blob/master/tests/files/my-blog) for a full, working structure.

### 1. creating a step definitions bootstrap 

We need to create a native step definition for cucumber, which then infects the other step definitions and creates a new zombie world.

create the file: `tests/js/cucumber/bootstrap.js` and fill in:

```js
module.exports = function() {
  var cucumberStep = this;
  var cukedZombie = require('cuked-zombie');

  var infected = cukedZombie.infect(cucumberStep, {
    world: require('../world-config'),
    steps: {
      dir: __dirname
    }
  });
};
```

with this bootstrap config cuked-zombie will search for all files in `__dirname` (next to your bootstrap.js) with the glob: `*-step-definitions.js`. These found step definitions are called "infected" because cuked-zombie adds cool (zombie-)features to them.

#### infected steps options

`dir` should be an absolute path name, or something that glob() (from current pwd) and require() will find. So its best to use something relative to `__dirname`

#### infected world options

Here are some examples for the world-config,js:

```js
module.exports = {
  cli: // path to your symfony command line interface,
  domains: {
    // os.hostname(): domain
    'my-server-name': 'staging.my-blog.com'
  },
  cookies: [{
    name: 'staging_access',
    value: 'tokenU1V2pUK'
  }]
};
```

If you don't want to switch per `os.hostname()` you can provide a domain directly: 

```
  domain: 'staging.my-blog.com'
```

### 2. creating an infected step

basically every cucumber step can be an infected step (they are backwards compatible, allthough doomed to die). Goto the `tests/js/cucumber` directory and create a node module like: `database-step-definitions.js`. The base content is just like this:

```js
module.exports = function() {

  this.Given(..., function(callback) {

  };
  
}
```

You can paste the `this.Given/When/Then()` statements from the cucumber-js runner cli output.

### 3. running cucumber

Run cucumber-js with its own command runner. 

```
cucumber-js --format=pretty -r tests/js/cucumber/bootstrap.js
```
we just provide the -r (step definitions options) with our own bootstrap.js

to run all tests, use:
```
cucumber-js --format=pretty -r tests/js/cucumber/bootstrap.js
``` 

to run just the `post.feature` and `post-admin.feature`, use: 
```
cucumber-js features/post.feature features/post-admin.feature --format=pretty -r tests/js/cucumber/bootstrap.js
``` 

to filter the scenarios using @-tags apply tags to your scenarios like this:

```gherkin
  @post
  Scenario: Writing a new post
  ...

  @delete
  Scenario: Delete a post
  ...

  @post
  Scenario: Rename a post
  ...

  Scenario: Edit a post
  ...
```

Now you can run scenarios with the selected tag(s). For example, you can use

```
cucumber-js --tags="@post" --format=pretty -r tests/js/cucumber/bootstrap.js
```

and so forth. Have a look a the cucumber-js command line runner for more options:

```
cucumber-js --help
```

## Debugging

Often its REALLY difficult to see what zombie is doing. Starting with version 2.0.x cuked-zombie has now a better fine-grained debug possibility.  
Use node debug for this:

```
DEBUG=* cucumber-js --format=pretty -r tests/js/cucumber/bootstrap.js
```

windows:
```
set DEBUG=*
cucumber-js --format=pretty -r tests/js/cucumber/bootstrap.js
```

You can use debug like this: `DEBUG=*,-fixtures` this will include all debug messages except for fixtures

 - `fixtures`: the output from cuked zombie, when fixtures are loaded (with symfony bridge)
 - `cuked-zombie`: internals from cuked zombie
 - `zombie`: all messages from zombie (event loop, etc)
 - `requests`: shows all http resonses and http requests that zombie does during a test (very useful for debugging ajax)

## advanced configuration

You can hook into the infected World on creation like this:

```js
var cukedZombie = require('cuked-zombie');
var infected = cukedZombie.infect(cucumberStep, {
  ...
});

infected.World.prototype.init = function(Browser) {
  Browser.extend(function(browser) {
    browser.on('authenticate', function(authentication) {
      authentication.username = 'myUser';
      authentication.password = 'myPw';
    });
  });

  // add properties to the available for all steps
  // this refers here the same this, bound to a cucumber step
  this.filled = {}; 
  
  this.myStepHelper = function() {
    // ...
  };
};
```
## simplifying step definitions

Imagine you have several css selectors, that need to be used in more than one step. I would be a code smell to copy and paste them. So lets write some helper functions.  
You can use `this.fn` in an infected step to inject functions in to your steps. You have the same scope as in the step for those helpers.

Lets assume your code in an infected step looks like this:
```js
module.exports = function(expect) {

  this.Then(/^a tab with title "([^"]*)" is added$/, function (label, callback) {
    var tab = this.css('ul.nav-tabs:first').exists()
      .css('li:contains("'+label+'")').exists();
    callback();
  });

  this.When(/^I (activate|select) the tab "([^"]*)"$/, function (nulll, label, callback) {
    // copy and paste from above
    var tab = this.css('ul.nav-tabs:first').exists()
      .css('li:contains("'+label+'")').exists();

    this.util.clickLink(tab.css('a').get(), callback);
  });
```   

After refactoring it should look like this:
```js
module.exports = function(expect) {

  this.fn.findTab = function(label) {
    return this.css('ul.nav-tabs:first').exists()
      .css('li:contains("'+label+'")').exists();
  };

  this.Then(/^a tab with title "([^"]*)" is added$/, function (label, callback) {
    this.findTab(label);
    callback();
  });

  this.When(/^I (activate|select) the tab "([^"]*)"$/, function (nulll, label, callback) {
    var tab = this.findTab(label);

    this.util.clickLink(tab.css('a').get(), callback);
  });
```

## Migration to 3.0.0 from 2.1.x
 - runs on cucumber-js 0.9 which has a lot of changes
 - dont run with grunt anymore use cucumber-js natively
 - see changelog of cucumber-js from 0.3 til 0.9 and:
   - you can return promises instead of the callback
   - dont use withCSS-flag anymore use `function(regexp, { withCSS: true}, function(arg1, arg2)) instead`
   - the callback.fail() isnt available anymore. If you call callback with first parameter its the error thrown.
 - `this.Before` and `this.After` are now available in step definitions
 - you can pass timeout with the options object (2nd parameter of your step)

instead of:
```js
infected.World = function(callback) {
  this.env = {};

  callback();
};
```

```js
infected.World.prototype.init = function(Browser) {
  this.env = {};
};
```

## Migration to 2.1.0 from 2.0.x
 - you need node 4.x.x to run cuked-zombie (especially for zombiejs)
 - you can use `this.fn` to extend own functions

## Migration to 2.0.0 from 1.2.x
 - read the changelog for zombie 3.x.x from zombie 2.0.x-alpha
 - use the new troubleshooting debug-mode for cuked zombie

## Migration to 1.2.x from 1.0.x and 1.1.x

 - uninstall the `grunt-cucumber` task from your package.json
 - remove the `cucumberjs: { ... }` section from your Gruntfile
 - if your features are not in the directory `features` next to the `Gruntfile.js` or your `bootstrap.js` is not in `tests\js\cucumber` adjust the config-section `cuked-zombie` in your Gruntfile like explained above
