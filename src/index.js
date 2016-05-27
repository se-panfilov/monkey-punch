var Monkey = (function (config) {
  'use strict';

  if (!config) console.error('Error: no config');

  config.linesDelimiter = config.linesDelimiter || '\n';
  var methodArr = config.obj[config.method].toString().split(config.linesDelimiter);
  //TODO (S.Panfilov) perhaps should have count without first and last lines (didn't sure)
  var linesCount = methodArr.length;

  config._keys = Object.keys(config);
  var numberSort = function (a, b) {
    return a > b
  };
  config._linesKeys = config._keys.filter(isFinite).sort(numberSort);
  config._minLineKey = Math.min.apply(null, config._linesKeys);
  config._maxLineKey = Math.max.apply(null, config._linesKeys);

  if (config._maxLineKey > linesCount) {
    console.error('Error: line number too big');
    return;
  }

  if (config._minLineKey <= 0) {
    console.error('Error: line number too lower than 0');
    return;
  }

  config._isLinesPatches = config._linesKeys.length > 0;
  var isBefore = !!config.before;
  var isAfter = !!config.after;

  var methods = {
    hack: function () {
      this._override(function (original) {
        return function () {
          //TODO (S.Panfilov) add support of calbacks instead of args for before and after
          if (isBefore) config.before.apply(this, arguments);
          var returnValue = original.apply(this, arguments);
          if (isAfter) config.after.apply(this, arguments);

          return returnValue;
        }
      });
    },
    _override: function (callback) {
      var object = config.obj;
      var method = config.method;

      if (config._isLinesPatches) {
        object[method] = this._modifyLines(config);
      }

      object[method] = callback(object[method]);
    },
    _modifyLines: function (config) {
      var arr = config.obj[config.method].toString().split(config.linesDelimiter);
      // Remove first line: "function (a) {" (to be honest we should first parse and remember args)
      arr.splice(0, 1);
      // Remove last line: "}"
      arr.splice(arr.length - 1, 1);

      for (var i = config._linesKeys.length - 1; i >= 0; i--) {
        var lineKey = config._linesKeys[i];
        arr.splice(lineKey, 0, config[lineKey]);
      }
      var str = arr.join(config.linesDelimiter);
      //TODO (S.Panfilov) add args parsing. Urgent!!!!!!!
      return new Function('a', 'b', str); //a -is our argument for "[method]" func
    },
    restore: function() {
      //TODO (S.Panfilov) 
    }
  };

  return methods.hack();
});

//Support of node.js
if (typeof module === 'object' && module.exports) module.exports = Monkey;