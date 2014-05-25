var chai = require('chai');

module.exports = function(that) {
  return {

    textButton: function(text, browser) {
      if (!browser) browser = that.browser;

      var buttons = browser.querySelectorAll('button,.btn'); // .btn are bootstrap2-elements with class .btn
      var candidates = [], candidate;

      for (var i = 0, button; i < buttons.length; i++) {
        button = buttons[i];
        candidates.push(candidate = button.textContent.trim());
        if (candidate === text) {
          return button;
        }
      }

      var inputs = browser.querySelectorAll("input[type=submit],button");
      var input;
      for (i = 0; i < inputs.length; i++) {
        input = inputs[i];

        if (input.name === text) {
          return input;
        }
      }

      for (i = 0; i < inputs.length; i++) {
        input = inputs[i];

        candidates.push(input.value);

        if (input.value === text) {
          return input;
        }
      }

      chai.assert(false, 'button with text: "'+text+'" not found. Buttons found('+candidates.length+'): '+candidates.join(', ')+"\n"+' html: '+browser.html());
    },

    textLink: function(text, browser) {
      if (!browser) browser = that.browser;

      var links = browser.querySelectorAll('body a'); 

      for (var i = 0, link; i < links.length; i++) {
        link = links[i];
        if (link.textContent.trim() === text) {
          return link;
        }
      }

      chai.assert(false, 'link with text: "'+text+'" not found');
    },

    pressButton: function(buttonValue, callback) {
      if (!callback) {
        throw new Error('you need to supply the callback argument to zombie-utils::pressButton()');
      }

      if (buttonValue.jquery) {
        buttonValue = buttonValue.get(0);
      }

      that.browser.pressButton(buttonValue, function() {
        // zombie is to stupid to do that correctly
        callback.call(that);
      });
    },

    fill: function(field, value, callback) {
      if (!callback) {
        throw new Error('you need to supply the callback argument to zombie-utils::fill()');
      }

      if (field.jquery) {
        field = field.get(0);
      }

      that.browser.fill(field, value);

      callback();
    },

    check: function(field, callback) {
      if (!callback) {
        throw new Error('you need to supply the callback argument to zombie-utils::check()');
      }

      if (field.jquery) {
        field = field.get(0);
      }

      that.browser.check(field);
      callback();
    },

    uncheck: function(field, callback) {
      if (!callback) {
        throw new Error('you need to supply the callback argument to zombie-utils::uncheck()');
      }

      if (field.jquery) {
        field = field.get(0);
      }

      that.browser.uncheck(field);
      callback();
    },

    clickLink: function(textLink, callback) {
      if (textLink.jquery) {
        textLink = textLink.get(0);
      }

      if (!callback) {
        throw new Error('you need to supply the callback argument to zombie-utils::clickLink()');
      }

      that.browser.click(textLink, function() {
        // zombie is to stupid to do that correctly
        callback.call(that);
      });
    }
  };
};