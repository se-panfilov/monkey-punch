var jsvat = (function () {
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
