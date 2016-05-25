var monkKeyPatch = (function () {
  'use strict';

  var exports = {
    override: function (object, methodName, callback) {
      object[methodName] = callback(object[methodName])
    },
    after: function (extraBehavior) {
      return function (original) {
        return function () {
          var returnValue = original.apply(this, arguments);
          extraBehavior.apply(this, arguments);
          return returnValue
        }
      }
    },
    before: function (extraBehavior) {
      return function (original) {
        return function () {
          extraBehavior.apply(this, arguments);
          return original.apply(this, arguments);
        }
      }
    },
    compose: function (extraBehavior) {
      return function (original) {
        return function () {
          return extraBehavior.call(this, original.apply(this, arguments));
        }
      }
    },
    benchmark: function (original) {
      return function () {
        var startTime = new Date().getTime();
        var returnValue = original.apply(this, arguments);
        var finishTime = new Date().getTime();
        console.log('Took', finishTime - startTime, 'ms.');
        return returnValue;
      }
    },
    memoize: function (original) {// XXX: Work only with functions with 1 argument.
      var memo = {};
      return function (x) {
        if (Object.prototype.hasOwnProperty.call(memo, x)) return memo[x];
        memo[x] = original.call(this, x);
        return memo[x];
      }
    }
  };

  //Support of node.js
  if (typeof module === 'object' && module.exports) module.exports = exports;

  return exports;
})();


'use strict';

var Monkey = (function (config) {

  if (!config) console.log('error');

  var obj = config.obj;
  var methodName = config.method;
  var method = obj[methodName];
  var methodArr = method.toString().split("\n");
  var linesCount = methodArr.length;

  //TODO (S.Panfilov) should check all possible valuse that upper than linesCount
  if (config[linesCount + 1]) console.log('error - string not in func range');

  //TODO (S.Panfilov) should check all possible valuse that lower than 0
  if (config['-1']) console.log('error - string not in func range');

  var isLinesPatches = false; //TODO (S.Panfilov) should check for keys like 1, 2, 3, etc...

  var fixedFields = ['obj', 'method', 'before', 'after'];

  if (isLinesPatches) {
    for (var key in config) {

      var isFixedField = false;
      for (var i = 0; i < fixedFields.length; i++) {
        var fixedField = fixedFields[i];


        if (key === fixedField) {
          isFixedField = (key === fixedField);
          break;
        }

        if (!isFixedField) {

        }
      }

    }
  }

  var exports = {
    patch: function () {
      //
    }
  };

  return exports;
});

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
  obj: exports,
  method: 'sum',
  before: doItBefore,
  after: doItAfter,
  1: doAtFirstLine,
  5: doAtFifthLine
});

sumMonkey.patch();