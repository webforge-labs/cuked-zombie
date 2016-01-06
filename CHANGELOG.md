# Changelog

This reports only the really major changes in versions

## 3.0.0
  - using cucumber 0.9.x there is a lot of changes:
    - callback.fail is not avaible anymore (if first parameter of cucumberCallback is not nil its an error)
    - 


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
