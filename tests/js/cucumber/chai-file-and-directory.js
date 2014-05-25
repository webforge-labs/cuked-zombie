module.exports = function (chai, utils) {
  var _ = require('lodash');
  var path = require('path');
  var fs = require('fs');

  var toPath = function(obj) {
    if (require('util').isArray(obj)) {
      return obj.join(path.sep);
    } else {
      return obj;
    }
  };

  chai.Assertion.addProperty('existingFile', function () {
    var file = toPath(this._obj);

    this.assert(
      fs.statSync(file).isFile(),
      "expected #{act} to be an existing file",
      "expected #{act} to not be an existing file",
      undefined,
      file
    );
  });

  chai.Assertion.addProperty('existingDirectory', function () {
    var dir = toPath(this._obj);

    this.assert(
      fs.statSync(dir).isDirectory(),
      "expected #{act} to be an existing directory",
      "expected #{act} to not be an existing directory",
      undefined,
      dir
    );
  });
};
