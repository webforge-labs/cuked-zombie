# Changelog

This reports only the really major changes in versions

## 3.0.0
  - the grunt task is removed you can use: `cucumber-js --format=pretty -r tests/js/cucumber/bootstrap.js` to run tests writen with cuked-zombie with cucumber-js natively
 - runs on cucumber-js 0.9 which has a lot of changes
 - see changelog of cucumber-js from 0.3 til 0.9 and:
   - world has no callback (see migrate-3.0.0.md)
   - you can return promises instead of the callback
   - dont use withCSS-flag anymore use `function(regexp, { withCSS: true}, function(arg1, arg2)) instead`
   - the callback.fail() isnt available anymore. If you call callback with first parameter its the error thrown.
 - `this.Before` and `this.After` are now available in step definitions
 - you can pass timeout with the options object (2nd parameter of your step)

## 2.1.0
  - using zombie >= 4.2.1 for that release
  - added `this.fn` support for helpers in step definitions
  - you need node >= 4.x.x to run this release

## 2.0.1

  - using zombie 3.0.x for that release (includes jsdom 3.x.x)
  - see changelog in zombie for upstream changes

## 1.2.0

  - removed dependency to `grunt-cucumber`
  - changed configuration name to `cuked-zombie` instead of cucumber-js
  - changed configuration format
  - configuration is completely optional
