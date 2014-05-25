
## create a step definitions bootstrap 

go to `tests/js/cucumber/bootstrap.js` and fill in:

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

with this bootstrap config cuked-zombie will search for all files in `__dirname` (near your bootstrap.js) with the format: `*-step-definitions.js`. These step definitions are called "infected" because cukedZombie infects them with cool features. (for example an infected zombie world that allows you to visit pages from your app without any setup).

### infected world options

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

### infected steps options

`dir` should be an absolute path name, or something that glob() (from current pwd) and require() will find. So its best to use something relative to `__dirname`

## create a new (already infected) step definition

goto the `tests/js/cucumber` directory and create a node module like: `database-step-definitions.js`. The base content is just like this:

```js
module.exports = function() {

  this.Given(..., function(callback) {

  };
  
}
```

You can paste the `this.Given/When/Then()` statements from the cucumber-js runner.