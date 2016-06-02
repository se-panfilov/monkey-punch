var Monkey = (function (config) {
  'use strict';

  if (!config) console.error('Error: no config');

  config.linesDelimiter = config.linesDelimiter || '\n';
  // var methodArr = config.obj[config.method].toString().split(config.linesDelimiter);
  // //TODO (S.Panfilov) perhaps should have count without first and last lines (didn't sure)
  // var linesCount = methodArr.length;

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

  var isBefore = !!config.before;
  var isAfter = !!config.after;

  var exports = {
    original: null,
    _override: function (callback) {
      var object = config.obj;
      var method = config.method;
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
      var name = this._getFnName(config.method);
      var str = strArr.join(linesDelimiter);
      var args = this._getParamNames(config.method);

      //this is for named function
      if (name) str = 'return function ' + name + ' () {' + str +'};';
      return new Function(args, str);
    },
    _modifyBody: function (bodyConfig) {
      var fnArr = this._getStrArr(config.obj[config.method], config.linesDelimiter);

      if (bodyConfig.positions)  fnArr = this._modifyAtPositions(fnArr, bodyConfig.positions);
      if (bodyConfig.regexps)  fnArr = this._modifyAtRegexp(fnArr, bodyConfig.regexps);
      return this._makeFn(fnArr, config.linesDelimiter)
    },
    _injectLine: function (arr, position, val) {
      var line = this._getLineNumber(position);
      var column = this._getColumnNumber(position);

      if (column > arr[line].length) column = arr.length;

      if (column > 0) {
        arr.splice(line, 0, val);
      } else {
        arr[line] = arr[line].slice(0, column) + val + arr[line].slice(column);
      }

      return arr;
    },
    _modifyAtPositions: function (fnArr, positions) {
      var positionsKeys = this._sortNumberArr(Object.keys(positions));

      for (var i = positionsKeys.length - 1; i >= 0; i--) {
        var positionKey = i;
        var positionVal = positions[i];
        //TODO (S.Panfilov) cur work point
        this._injectLine(fnArr, positionKey, positionVal);
      }

      return fnArr;
    },
    _modifyAtRegexp: function (regexps) {
      //TODO (S.Panfilov)
      //   regexps: {
      //     '\)\n': addSemiQuote
      //   },


    },
    _getFnName: function (fn) {
      if (fn.name) return fn.name;

      var regexp = /^function\s+([\w\$]+)\s*\(/;
      return regexp.exec(fn.toString())[1];
    },
    _getParamNames: function (fn) {
      var STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
      var ARGUMENT_NAMES = /([^\s,]+)/g;

      var fnStr = fn.toString().replace(STRIP_COMMENTS, '');
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