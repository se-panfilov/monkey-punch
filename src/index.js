var Monkey = (function (config) {
  'use strict';

  if (!config) console.error('Error: no config');

  config.body.linesDelimiter = config.body.linesDelimiter || '\n';

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
    getLineNumber: function (key) {
      key = key.trim();
      var commaIndex = key.indexOf(',');
      if (commaIndex === -1) return key;
      return +key.substr(0, key.indexOf(','));
    },
    getColumnNumber: function (key) {
      key = key.trim();
      var commaIndex = key.indexOf(',');
      if (commaIndex === -1) return null;
      return +key.substr(key.indexOf(',') + 1);
    },
    getColumnAsDecimal: function (line, column) {
      if (!column && column !== 0) return -(line + '.' +'9999999');

      var isLower =column< 0;
      if (isLower) column *= -1;

      var result = +(line + '.' + column);

      if (isLower) result *= -1;

      return result;
    },
    getPositionWeight: function (position) {
      var column = this.getColumnNumber(position);
      var line = +this.getLineNumber(position);

      return line + this.getColumnAsDecimal(line, column);
    },
    sortNumberArr: function (arr) {
      var numberSort = function (a, b) {
        return _p.getPositionWeight(a) < _p.getPositionWeight(b);
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
    makeFn: function (fnArr, originalFn, linesDelimiter, isEval) {
      var fnName = this.getFnName(originalFn);
      var fnStr = fnArr.join(linesDelimiter);
      var fnArgs = this.getParamNames(originalFn);
      var result;

      if (!isEval) {
        //this is for named function
        if (fnName) fnStr = 'return function ' + fnName + ' () {' + fnStr + '};';

        console.log(fnStr);
        result = new Function(fnArgs, fnStr);
      } else {
        //TODO (S.Panfilov) debug this branch
        //TODO (S.Panfilov) what about comma at the end?
        result = eval('(function ' + fnName + '(' + fnArgs.toString + ') {' + fnStr + '})');
      }
      return result;
    },
    modifyBody: function (fnArr, bodyConfig) {
      if (bodyConfig.positions)  fnArr = this.modifyAtPositions(fnArr, bodyConfig.positions);
      if (bodyConfig.regexps)  fnArr = this.modifyAtRegexp(fnArr, bodyConfig.regexps);
      return fnArr;
    },
    injectAtLine: function (arr, position, val) {
      var line = this.getLineNumber(position);
      var column = this.getColumnNumber(position);
      var isNoColumn = !column && column !== 0;

      //TODO (S.Panfilov) this should be in docs (we are trimming the lines)
      arr[line] = arr[line].trim();

      if (column > arr[line].length || isNoColumn) column = arr[line].length;

      // if (column > 0) {
      // arr.splice(line, 0, val);
      // } else {
      //TODO (S.Panfilov) here we inject the result of 'val()', but perhaps will be better to pass function here somehow
      //TODO (S.Panfilov) the idea is to run val() when only modified function will be called
      //TODO (S.Panfilov) and to have an ability to pass context here
      //TODO (S.Panfilov) in this case would be a reason to call val's cb
      if (typeof val === 'function') val = val();
      arr[line] = arr[line].slice(0, column) + val + arr[line].slice(column);
      // }

      return arr;
    },
    isIllegalKey: function (arr, fnArr) {
      var line;

      for (var i = 0; i < arr.length; i++) {
        var positionKey = arr[i];
        line = this.getLineNumber(positionKey);
        //TODO (S.Panfilov) add getColumnNumber() > cur line length (or trim line length)
        if (line < 0 || line >= fnArr.length)  return true;//TODO (S.Panfilov) Cur work point
      }

      return false;
    },
    modifyAtPositions: function (fnArr, positions) {
      var positionsKeys = this.sortNumberArr(Object.keys(positions));

      if (this.isIllegalKey(positionsKeys, fnArr)) return console.error('Illegal key present');

      for (var i = positionsKeys.length - 1; i >= 0; i--) {
        var positionKey = positionsKeys[i];
        var positionVal = positions[positionKey];
        this.injectAtLine(fnArr, positionKey, positionVal);
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
            while ((match = regex.exec(fnStr)) !== null) {
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

      return this.getStrArr(fnArr, config.body.linesDelimiter);
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
    originalFn: null,
    modifiedFn: null,
    linesDelimiter: config.body.linesDelimiter,
    before: config.before,
    after: config.after,
    isLazy: false,
    punch: function () {
      this.originalFn = this.config.obj[this.config.method];

      if (this.config.body) {
        this.modifiedFn = this.config.obj[this.config.method];
        var fnArr = _p.getStrArr(this.modifiedFn, this.linesDelimiter);
        _p.modifyBody(fnArr, config.body);
        this.modifiedFn = _p.makeFn(fnArr, this.originalFn, this.linesDelimiter);
      }

      if (!this.before && !this.after) {
        this.config.obj[this.config.method] = this.modifiedFn || this.originalFn;
      } else {
        var self = this;
        this.config.obj[this.config.method] = function () {

          if (isBefore) self.before(arguments);

          var returnValue = (self.modifiedFn) ? self.modifiedFn(arguments) : self.originalFn(arguments);

          if (isAfter) self.after(arguments);

          return returnValue;
        };
      }

      return this;
    },
    restore: function () {
      config.obj[config.method] = this.original;
      this.isModified = false;
      return this;
    },
    clear: function (isClearOrigin) {
      //TODO (S.Panfilov) clear monkey object, but stay patched
      //Perhaps should save optional possibility to restore after clear
      return this;
    }
  };

  if (!exports.isLazy) return exports.punch();

  return exports;
});

//Support of node.js
if (typeof module === 'object' && module.exports) module.exports = Monkey;

//TODO (S.Panfilov) Roadmap:
// - Add support for one-liners
// - Add "punch": ability to patch func again after restore was called
// - Add "Lazy" option (do not patch immediately)
// - Add ability to patch several methods at once (in arr of str)
// - Add ability to use eval instead of new Func
// - make sure column can be set up from the end (-1)
// - Before and After should be called with same args as origin
// - Check closures and globals in terms of new Func

// var myMonkey = new Monkey({
//   obj: patchTarget,
//   method: ['sum', 'min'], //patch one (string) or several methods (array of str)
//   before: doItBefore, //only function here
//   after: doItAfter, // should be called with same args as origin
//   isLazy: false, // lazy allow you to not patch immediately
//   body: {
//     linesDelimiter: '\n',
//     isEval: false, //option to use eval instead of new Function
//     regexps: {
//       '/\)\n/g': addSemiQuoteFn, // add ';' after each ')'
//       '/\{/g': ' ' // add space before each'{'
//     },
//     positions: {
//       1: '// injection to line one',
//       5: '// injection to line five',
//       2: lineTwoInjectionFunc,
//       '6,10': '// Injection to line 6 column 10',
//       '2,3': lineTwoColumnThreeInjectionFunc,
//       '2,-1': lineTwoColumnOneFromEndInjectionFunc
//     }
//   }
// });

// ...
// myMonkey.restore();
// ...