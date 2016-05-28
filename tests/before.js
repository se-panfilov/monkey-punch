'use strict';

var expect = require('chai').expect;
var Monkey = require('../src/index.js');

var patchTarget;

var bodyStr;

beforeEach(function () {
  bodyStr =
      '-------Line: 0-------\n' +
      'Line: 1\n' +
      'Line: 2\n' +
      'Line: 3\n' +
      'Line: 4\n' +
      '-------Line: 5-------\n';

  patchTarget = {
    property: '',
    sum: function (a, b) {
      this.property += '-------Line: 0-------\n';
      this.property += 'Line: 1\n';
      this.property += 'Line: 2\n';
      this.property += 'Line: 3\n';
      this.property += 'Line: 4\n';
      this.property += '-------Line: 5-------\n';
      return a + b;
    }
  };
});

function insertString(stringsArr, lineNum, value) {
  var expectedStrArr = stringsArr.split('\n');

  //remove empty lines
  // for (var i = expectedStrArr.length - 1; i >= 0; i--) {
  //   var str = expectedStrArr[i];
  //   if (str.length === 0) {
  //     expectedStrArr.splice(i, 1)
  //   }
  // }

  expectedStrArr.splice(lineNum, 0, value);
  return expectedStrArr.join('\n');
}

describe('Before tests.', function () {
  it('Patch value from closure.', function () {
    var pureResult = patchTarget.sum(1, 1);
    expect(pureResult).equal(2);
    patchTarget.property = '';

    var lineOneInjectionStr = 'this.property += \'-> injection on line 1\';';
    var lineFiveInjectionStr =
        'this.property += \'-> injection on line 5\';' +
        ' a += 1;\n' +
        'this.property += \'end of injection(5) ->\';';

    var expectedStr;
    expectedStr = insertString(bodyStr, 5, lineFiveInjectionStr);
    expectedStr = insertString(expectedStr, 1, lineOneInjectionStr);
    expectedStr = insertString(expectedStr, 0, '!--before--!\n');
    expectedStr += '!--after---!\n';

    function doItBefore(cb) {
      //TODO (S.Panfilov) add support of callbacks
      this.property += '!--before--!\n';
      //if (cb) cb();
    }

    function doItAfter(cb) {
      this.property += '!--after---!\n';
      //if (cb) cb();
    }

    new Monkey({
      obj: patchTarget,
      method: 'sum',
      before: doItBefore,
      after: doItAfter,
      1: lineOneInjectionStr,
      5: lineFiveInjectionStr
    });

    //expect(patchTarget.property).equal(bodyStr);
    var patchedResult = patchTarget.sum(1, 1);
    expect(patchedResult).equal(3);
    console.log(patchTarget.property);
    expect(patchTarget.property).equal(expectedStr);
  });
});
