# Developer notes

notice that the running of cucumber is internally tested with cucumber-js itself. npm test runs cucumber-js natively. It uses the `tests/js/cucumber/stepDefinitions.js` file for all tests. Those step definitions will call an inner installation of a full project with cuked zombie installed. The roots of these projects are in `test/files/`.