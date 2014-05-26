module.exports = function() {

  this.When(/^I click on "([^"]*)"$/, function(arg1, callback) {
    callback();
  });

  this.When(/^I fill some details$/, function(callback) {
    // express the regexp above with the code you wish you had
    callback();
  });

  this.When(/^I save the post$/, function(callback) {
    // express the regexp above with the code you wish you had
    callback();
  });

};