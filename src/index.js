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

  var _p = {
    override: function (callback) {
      var object = config.obj;
      var method = config.method;
      object[method] = callback(object[method]);
    },
    getLineNumber: function (key) {
      key = key.trim();
      var commaIndex = key.indexOf(',');
      if (commaIndex === -1) return key;
      return +key.substr(0, key.indexOf(','));
    },
    getColumnNumber: function (key) {
      key = key.trim();
      var commaIndex = key.indexOf(',');
      if (commaIndex === -1) return 0;
      return +key.substr(key.indexOf(',') + 1);
    },
    sortNumberArr: function (arr) {
      var numberSort = function (a, b) {
        return this.getLineNumber(a) > this.getLineNumber(b)
      };

      return arr.sort(numberSort);
    },
    getStrArr: function (fn, linesDelimiter) {
      var fnArr = fn.toString().split(linesDelimiter);
      //TODO (S.Panfilov) check this for one-liner
      // Remove first line: "function (a) {"
      fnArr.splice(0, 1);
      // Remove last line: "}"
      fnArr.splice(fnArr.length - 1, 1);
      return fnArr;
    },
    makeFn: function (fnArr, linesDelimiter) {
      var fnName = this.getFnName(config.method);
      var fnStr = fnArr.join(linesDelimiter);
      var fnArgs = this.getParamNames(config.method);

      //this is for named function
      if (fnName) fnStr = 'return function ' + fnName + ' () {' + fnStr + '};';
      return new Function(fnArgs, fnStr);
    },
    modifyBody: function (bodyConfig) {
      var fnArr = this.getStrArr(config.obj[config.method], config.linesDelimiter);

      if (bodyConfig.positions)  fnArr = this.modifyAtPositions(fnArr, bodyConfig.positions);
      if (bodyConfig.regexps)  fnArr = this.modifyAtRegexp(fnArr, bodyConfig.regexps);
      return this.makeFn(fnArr, config.linesDelimiter)
    },
    injectLine: function (arr, position, val) {
      var line = this.getLineNumber(position);
      var column = this.getColumnNumber(position);

      if (column > arr[line].length) column = arr.length;

      if (column > 0) {
        arr.splice(line, 0, val);
      } else {
        arr[line] = arr[line].slice(0, column) + val + arr[line].slice(column);
      }

      return arr;
    },
    modifyAtPositions: function (fnArr, positions) {
      var positionsKeys = this.sortNumberArr(Object.keys(positions));

      for (var i = positionsKeys.length - 1; i >= 0; i--) {
        var positionKey = positionsKeys[i];
        var positionVal = positions[positionsKeys];
        //TODO (S.Panfilov) cur work point
        this.injectLine(fnArr, positionKey, positionVal);
      }

      return fnArr;
    },
    wrapRegex: function (str) {

      //TODO (S.Panfilov) this woudn't work cause of '/g', '/i', etc. Should make new RegExp perhaps
      var isWrapped = (str.indexOf('/') === 0 && str.lastIndexOf('/'));

      return (isWrapped) ? str : ('/' + str + '/');
    },
    modifyAtRegexp: function (fnArr, regexpObj, linesDelimiter) {
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
              fnStr = (this.modifyAtPositions(this.getStrArr(fnStr), positions)).join(linesDelimiter);
            }

          } else { //string
            fnStr.replace(this.wrapRegex(regex), fnOrStr);
          }
        }
      }


      return this.getStrArr(fnArr, config.linesDelimiter);

    },
    getFnName: function (fn) {
      if (fn.name) return fn.name;

      var regexp = /^function\s+([\w\$]+)\s*\(/;
      var nameArr = regexp.exec(fn.toString());
      return (nameArr) ? nameArr[1] : null;
    },
    getParamNames: function (fn) {
      var STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
      var ARGUMENT_NAMES = /([^\s,]+)/g;

      var fnStr = fn.toString().replace(STRIP_COMMENTS, '');
      var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

      return result || [];
    }
  };

  var exports = {
    config: config,
    original: null,
    before: config.before,
    after: config.after,
    modifiedFnBody: null,
    lazy: false,
    punch: function () {
      _p.override(function (original) {
        this.original = original;
        return function () {
          if (isBefore) this.before.apply(this, arguments);
          if (config.body) original = _p.modifyBody(config.body);
          var returnValue = original.apply(this, arguments);
          if (isAfter) this.after.apply(this, arguments);

          return returnValue;
        }
      });

      return exports;
    },
    restore: function () {
      config.obj[config.method] = this.original;
    },
    clear: function (isClearOrigin) {
      //TODO (S.Panfilov) clear monkey object, but stay patched
      //Perhaps should save optional possibility to restore after clear
    }
  };

  if (!exports.lazy) return exports.punch();

  return exports;
});

//Support of node.js
if (typeof module === 'object' && module.exports) module.exports = Monkey;

//Roadmap:
//TODO (S.Panfilov) Add support for one-liners
//TODO (S.Panfilov) Add support for functions as well as strings in body params
//TODO (S.Panfilov) add "punch": ability to patch func agaig after restore was called
//TODO (S.Panfilov) Add "Lazy" option (do not patch immediately)

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