var Monkey = (function (config) {
  'use strict';

  if (!config) console.error('Error: no config');

  config.linesDelimiter = config.linesDelimiter || '\n';
  // var methodArr = config.obj[config.method].toString().split(config.linesDelimiter);
  // //TODO (S.Panfilov) perhaps should have count without first and last lines (didn't sure)
  // var linesCount = methodArr.length;

  config._keys = Object.keys(config);
  var numberSort = function (a, b) {
    return a > b
  };

  // config._linesKeys = config._keys.filter(isFinite).sort(numberSort);
  // config._minLineKey = Math.min.apply(null, config._linesKeys);
  // config._maxLineKey = Math.max.apply(null, config._linesKeys);

  //TODO (S.Panfilov) return errors for out of range
  // if (config._maxLineKey > linesCount) {
  //   console.error('Error: line number too big');
  //   return;
  // }
  //
  // if (config._minLineKey <= 0) {
  //   console.error('Error: line number too lower than 0');
  //   return;
  // }

  config._isLinesPatches = config._linesKeys.length > 0;
  var isBefore = !!config.before;
  var isAfter = !!config.after;

  var exports = {
    original: null,
    _override: function (callback) {
      var object = config.obj;
      var method = config.method;

      if (config._isLinesPatches) {
        object[method] = this._modifyLines(config);
      }

      object[method] = callback(object[method]);
    },
    _getLineNumber: function (key) {
      key = key.trim();
      var commaIndex = key.indexOf(',');
      if (commaIndex === -1) return key;
      return +key.substr(0, key.indexOf(','));
    },
    _getColumnNumber: function (key) {
      key = key.trim();
      var commaIndex = key.indexOf(',');
      if (commaIndex === -1) return 0;
      return +key.substr(key.indexOf(',') + 1);
    },
    _sortNumberArr: function (arr) {
      var numberSort = function (a, b) {
        return this._getLineNumber(a) > this._getLineNumber(b)
      };

      return arr.sort(numberSort);
    },
    _getStrArr: function (fn, linesDelimiter) {
      var fnArr = fn.toString().split(linesDelimiter);
      // Remove first line: "function (a) {"
      fnArr.splice(0, 1);
      // Remove last line: "}"
      fnArr.splice(fnArr.length - 1, 1);
      return fnArr;
    },
    _makeFn: function (strArr, linesDelimiter) {
      var str = strArr.join(linesDelimiter);
      var args = this._getParamNames(config.method);
      //TODO (S.Panfilov) take care about functions name
      return new Function(args, str);
    },
    _modifyBody: function (bodyConfig) {
      var fnArr = this._getStrArr(config.obj[config.method], config.linesDelimiter);

      if (bodyConfig.positions)  fnArr = this._modifyAtPositions(fnArr, bodyConfig.positions);
      if (bodyConfig.regexps)  fnArr = this._modifyAtRegexp(fnArr, bodyConfig.regexps);
      return this._makeFn(fnArr, config.linesDelimiter)
    },
    _modifyAtPositions: function (positions) {
      //TODO (S.Panfilov)
      //   positions: {
      //     1: lineOneInjectionStr,
      //     5: lineFiveInjectionStr,
      //     '6,10': lineSixColumnTenInjectionStr
      //   }

      for (var key in positions) {
        if (positions.hasOwnProperty(key)) {
          // positionConfig[key]
        }
      }
      positions = this._sortNumberArr(positions);

      // for (var i = positions.length - 1; i >= 0; i--) {
      //   var lineKey = positions[i];
      //   arr.splice(lineKey, 0, config[lineKey]);
      // }

    },
    _modifyAtRegexp: function (regexpsConfig) {
      //TODO (S.Panfilov)
      //   regexps: {
      //     '\)\n': addSemiQuote
      //   },


    },
    // _modifyLines: function (config) {
    //   var arr = config.obj[config.method].toString().split(config.linesDelimiter);
    //
    //   // Remove first line: "function (a) {"
    //   arr.splice(0, 1);
    //   // Remove last line: "}"
    //   arr.splice(arr.length - 1, 1);
    //
    //   for (var i = config._linesKeys.length - 1; i >= 0; i--) {
    //     var lineKey = config._linesKeys[i];
    //     arr.splice(lineKey, 0, config[lineKey]);
    //   }
    //
    //   var str = arr.join(config.linesDelimiter);
    //   var args = this._getParamNames(config.method);
    //   //TODO (S.Panfilov) take care about functions name
    //   return new Function(args, str);
    // },
    _getParamNames: function (func) {
      var STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
      var ARGUMENT_NAMES = /([^\s,]+)/g;

      var fnStr = func.toString().replace(STRIP_COMMENTS, '');
      var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

      return result || [];
    },
    restore: function () {
      config.obj[config.method] = this.original;
    }
  };

  (function main() {
    exports._override(function (original) {
      exports.original = original;
      return function () {
        if (isBefore) config.before.apply(this, arguments);
        if (config.body) original = exports._modifyBody(config.body);
        var returnValue = original.apply(this, arguments);
        if (isAfter) config.after.apply(this, arguments);

        return returnValue;
      }
    });
  })();

  return exports;
});

//Support of node.js
if (typeof module === 'object' && module.exports) module.exports = Monkey;


// new Monkey({
//   obj: patchTarget,
//   method: 'sum',
//   linesDelimiter: '\n',
//   before: doItBefore,
//   after: doItAfter,
//   body: {
//     regexps: {
//       '\)\n': addSemiQuote
//     },
//     positions: {
//       1: lineOneInjectionStr,
//       5: lineFiveInjectionStr,
//       '6,10': lineSixColumnTenInjectionStr
//     }
//   }
// });