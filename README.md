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

  - a grunt task to run all or just single cucumber steps
  - some convenient functions to manage different hosts your testing on

## Usage

To use cucumber with zombie you need to infect your step definitions and create an infected world (a world that knows how to invoke zombie(s)).

1. create a step definitions bootstrap and use it as the only stepDefinition in cucumber
2. create your infected steps (they are compatible to native cucumber steps)
3. run cucumber with the bootstrap or use the internal task `grunt cucumber`

*For this example* it is assumed that your features are stored in `features/something.feature`. Your infected step definitions should be stored in files grouped by domain in: `tests/js/cucumber/domain-step-definitions.js`. For example: `tests/js/cucumber/database-step-definitions.js` includes all steps dealing with database stuff. Have a look at [tests/files/my-blog](https://github.com/webforge-labs/cuked-zombie/blob/master/tests/files/my-blog) for a full, working structure.

### 1. creating a step definitions bootstrap 

We need to create a native step definition for cucumber, which then infects the other step definitions and creates a new zombie world.

create the file: `tests/js/cucumber/bootstrap.js` and fill in:

```js
module.exports = function() {
  var cucumberStep = this;
  var cukedZombie = require('cuked-zombie');

  var infected = cukedZombie.infect(cucumberStep, {
    world: worldOptions
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

Here are some examples for the worldOptions:

```js
var worldOptions = {
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

The easiest way is to run cucumber with the built in grunt task:

Gruntfile.js
```js
  grunt.loadNpmTasks('grunt-cucumber');
  grunt.loadNpmTasks('cuked-zombie');

  grunt.initConfig({
    cucumberjs: {
      // config for all features when called with: `grunt cucumber`
      all: {
        src: 'features',
        options: {
          steps: "tests/js/cucumber/bootstrap.js",
          format: "pretty"
        }
      },

      // config for single features when called with `grunt --filter some-feature`
      features: {
        src: 'features',
        options: {
          steps: "tests/js/cucumber/bootstrap.js",
          format: "pretty"
        }
      }
    }
  });
```

This needs [grunt-cucumber](https://github.com/s9tpepper/grunt-cucumber-js) installed, because cuked-zombie will use this task to run cucumber internally.

use 
```
grunt cucumber
``` 

to run all tests or:

```
grunt cucumber --filter post
``` 

to run just the `post.feature` and `post-admin.feature`.
