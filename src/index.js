'use strict';

var Monkey = (function (config) {

  if (!config) console.log('no config error');

  config.linesDelimiter = config.linesDelimiter || '\n';
  var methodArr = config.obj[config.method].toString().split(config.linesDelimiter);
  //TODO (S.Panfilov) perhaps should have count without first and last lines (didn't sure)
  var linesCount = methodArr.length;

  config._keys = Object.keys(config);
  config._linesKeys = config._keys.filter(isFinite);
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

      // exports._override(config.obj, config.method, exports._before(function () {
      //   config.before()
      // }));

      this._override(config.obj, config.method, function (original) {
        if (isBefore) config.before.apply(this, arguments);
        var returnValue = original.apply(this, arguments);
        if (isAfter) config.before.apply(this, arguments);

        return returnValue;
      });
    },
    // _override: function (object, methodName, callback) {
    //   object[methodName] = callback(object[methodName])
    // },
    _override: function (callback) {
      var object = config.object;
      var method = config.method;

      if (config._isLinesPatches) {
        for (var i = 0; i < config._linesKeys.length; i++) {
          var lineKey = config._linesKeys[i];

        }
        this._modifyBody(config[lineKey], lineKey)
      }

      object[method] = callback(object[method])
    },
    _modifyBody: function (injection, injectionLine) {
      var object = config.object;
      var method = config.method;

      var delimiter = '\n';
      // Split function into array of strings
      var arr = obj[method].toString().split(delimiter);
      // Remove first line: "function (a) {" (to be honest we should first parse and remember args)
      arr.splice(0, 1);
      //Remove last line: "}"
      arr.splice(arr.length - 1, 1);
      // Insert our expression (b = 2) at "line 2"
      arr.splice(injectionLine, 0, injection);
      // Create a string with our function
      var str = arr.join(delimiter);
      //Create function with new Function()
      var newFunc = new Function("a", str); //a -is our argument for "[method]" func
      obj[method] = newFunc;
    },
    _before: function (extraBehavior) {
      return function (original) {
        return function () {
          extraBehavior.apply(this, arguments);
          return original.apply(this, arguments);
        }
      }
    },
    _after: function (extraBehavior) {
      return function (original) {
        return function () {
          var returnValue = original.apply(this, arguments);
          extraBehavior.apply(this, arguments);
          return returnValue
        }
      }
    }
  };

  return exports;
});

var patchTarget = {
  sum: function (a, b) {
    console.log('Line: 0');
    console.log('Line: 1');
    console.log('Line: 2');
    console.log('Line: 3');
    console.log('sum! (line 4)');
    console.log('Line: 5');
    return a + b;
  }
};

function doItBefore(cb) {
  console.log('before');
  if (cb) cb();
}

function doItAfter(cb) {
  console.log('after');
  if (cb) cb();
}

function doAtFirstLine(cb) {
  console.log('First(1) line');
  if (cb) cb();
}

function doAtFifthLine(cb) {
  console.log('Fifth(5) line');
  if (cb) cb();
}

var sumMonkey = new Monkey({
  obj: patchTarget,
  method: 'sum',
  before: doItBefore,
  after: doItAfter,
  1: doAtFirstLine,
  5: doAtFifthLine
});

var result = sumMonkey.hack();
console.log(result);