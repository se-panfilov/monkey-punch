'use strict';

var Monkey = (function (config) {

  if (!config) console.log('error');

  var obj = config.obj;
  var methodName = config.method;
  var method = obj[methodName];
  var methodArr = method.toString().split("\n");
  var linesCount = methodArr.length;

  // //TODO (S.Panfilov) should check all possible valuse that upper than linesCount
  // if (config[linesCount + 1]) console.log('error - string not in func range');
  //
  // //TODO (S.Panfilov) should check all possible valuse that lower than 0
  // if (config['-1']) console.log('error - string not in func range');

  var isLinesPatches = false; //TODO (S.Panfilov) should check for keys like 1, 2, 3, etc...

  // var fixedFields = ['obj', 'method', 'before', 'after'];
  //
  // if (isLinesPatches) {
  //   for (var key in config) {
  //
  //     var isFixedField = false;
  //     for (var i = 0; i < fixedFields.length; i++) {
  //       var fixedField = fixedFields[i];
  //
  //
  //       if (key === fixedField) {
  //         isFixedField = (key === fixedField);
  //         break;
  //       }
  //
  //       if (!isFixedField) {
  //
  //       }
  //     }
  //
  //   }
  // }

  var exports = {
    patch: function () {

      exports._override(config.obj, config.method, exports._before(function () {
        config.before()
      }));

      // this._override(config.obj, config.method, function (original) {
      //   if (typeof config.before === 'function') {
      //     config.before.apply(this, arguments);
      //   }
      //
      //   var returnValue //= original.apply(this, arguments);
      //
      //   if (typeof config.after === 'function') {
      //     config.after.apply(this, arguments);
      //   }
      //
      //   return returnValue;
      // });
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

var result = sumMonkey.patch();
console.log(result);