var Monkey = (function (config) {
  'use strict';

  if (!config) console.error('Error: no config');

  config.linesDelimiter = config.linesDelimiter || '\n';

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
      //TODO (S.Panfilov) check this for one-liner
      // Remove first line: "function (a) {"
      fnArr.splice(0, 1);
      // Remove last line: "}"
      fnArr.splice(fnArr.length - 1, 1);
      return fnArr;
    },
    _makeFn: function (fnArr, linesDelimiter) {
      var fnName = this._getFnName(config.method);
      var fnStr = fnArr.join(linesDelimiter);
      var fnArgs = this._getParamNames(config.method);

      //this is for named function
      if (fnName) fnStr = 'return function ' + fnName + ' () {' + fnStr + '};';
      return new Function(fnArgs, fnStr);
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
    _wrapRegex: function (str) {

      //TODO (S.Panfilov) this woudn't work cause of '/g', '/i', etc. Should make new RegExp perhaps
      var isWrapped = (str.indexOf('/') === 0 && str.lastIndexOf('/'));

      return (isWrapped) ? str : ('/' + str + '/');
    },
    _modifyAtRegexp: function (fnArr, regexpObj, linesDelimiter) {
      var fnStr = fnArr.join(linesDelimiter);

      for (var regex in regexpObj) {
        if (regexpObj.hasOwnProperty(regex)) {
          var fnOrStr = regexpObj[regex];
          if (typeof fnOrStr === 'function') {
            //(asd.toString()).search(/\)\n/g)
            var match;
            var matchesArr = [];
            while ((match = regex.exec(fnStr)) != null) {
              matchesArr.push(match.index);
            }

            for (var i = 0; i < matchesArr.length; i++) {
              var _match = matchesArr[i];
              var positions = [{}];
              positions[0][_match] = fnOrStr;
              fnStr = (this._modifyAtPositions(this._getStrArr(fnStr), positions)).join(linesDelimiter);
            }

          } else { //string
            fnStr.replace(this._wrapRegex(regex), fnOrStr);
          }
        }
      }


      return this._getStrArr(fnArr, config.linesDelimiter);

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

//Roadmap:
//TODO (S.Panfilov) Add support for one-liners
//TODO (S.Panfilov) Add support for functions as well as strings in body params

// var myMonkey = new Monkey({
//   obj: patchTarget,
//   method: 'sum',
//   linesDelimiter: '\n',
//   before: doItBefore,
//   after: doItAfter,
//   body: {
//     regexps: {
//       '/\)\n/g': addSemiQuoteFn, // add ';' after each ')'
//       '/\{/g': ' ' // add space before each'{'
//     },
//     positions: {
//       1: '// injection to line one',
//       5: '// injection to line five',
//       2: lineTwoInjectionFunc,
//       '6,10': '// Injection to line 6 column 10',
//       '2,3': lineTwoColumnThreeInjectionFunc
//     }
//   }
// });

// ...
// myMonkey.restore();
// ...