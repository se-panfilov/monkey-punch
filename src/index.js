'use strict';

var Monkey = (function (config) {

  if (!config) console.log('no config error');

  var obj = config.obj;
  var methodName = config.method;
  var method = obj[methodName];
  var lineDelimiter = '\n';
  var methodArr = method.toString().split(lineDelimiter);
  //TODO (S.Panfilov) perhaps should have count without first and last lines (didn't sure)
  var linesCount = methodArr.length;

  var keys = Object.keys(obj);
  var linesKeys = keys.filter(isFinite);
  var minLineKey = Math.min.apply(null, linesKeys);
  var maxLineKey = Math.max.apply(null, linesKeys);

  if (maxLineKey > linesCount) {
    console.log('error - string not in func range (max)');
    return;
  }

  if (minLineKey <= 0) {
    console.log('error - string not in func range (min)');
    return;
  }

  var isLinesPatches = linesKeys.length > 0;
  var isBefore = typeof config.before === 'function';
  var isAfter = typeof config.after === 'function';

  function modifyFuncBody(obj, method, injection, injectionLine) {
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
  }

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
    _override: function (object, methodName, callback) {
      object[methodName] = callback(object[methodName])
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
    console.log('sum!');
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