'use strict';

var Monkey = (function (config) {

  if (!config) console.log('no config error');

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
    console.log('error - string not in func range (max)');
    return;
  }

  if (config._minLineKey <= 0) {
    console.log('error - string not in func range (min)');
    return;
  }

  config._isLinesPatches = config._linesKeys.length > 0;
  var isBefore = !!config.before;
  var isAfter = !!config.after;

  var exports = {
    hack: function () {
      this._override(function (original) {
        return function () {
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

      return new Function('a', 'b', str); //a -is our argument for "[method]" func
    }
  };

  return exports;
});

var patchTarget = {
  sum: function (a, b) {
    console.log('-------Line: 0-------');
    console.log('Line: 1');
    console.log('Line: 2');
    console.log('Line: 3');
    console.log('sum! (line 4)');
    console.log('-------Line: 5-------');
    return a + b;
  }
};

function doItBefore(cb) {
  console.log('before');
  //if (cb) cb();
}

function doItAfter(cb) {
  console.log('after');
  //if (cb) cb();
}

var sumMonkey = new Monkey({
  obj: patchTarget,
  method: 'sum',
  before: doItBefore,
  after: doItAfter,
  1: 'console.log(\'-> injection on line 1\')',
  5: 'console.log(\'-> injection on line 5\');\n a +=a; \n console.log(\'end of injection ->\')'
});

sumMonkey.hack();
var result = patchTarget.sum(1, 2);
console.log('result:' + result);