'use strict';

var expect = require('chai').expect;
var Monkey = require('../src/index.js');

var patchTarget;

var bodyStrArr;
var beforeStr = '!--before--!';

beforeEach(function () {
  bodyStrArr = [
    '-------Line: 0-------',
    'Line: 1',
    'Line: 2',
    'Line: 3',
    'Line: 4',
    '-------Line: 5-------'
  ];

  patchTarget = {
    property: [],
    sum: function (a, b) {
      this.property.push('-------Line: 0-------');
      this.property.push('Line: 1');
      this.property.push('Line: 2');
      this.property.push('Line: 3');
      this.property.push('Line: 4');
      this.property.push('-------Line: 5-------');
      return a + b;
    },
    closureVal: 1,
    closureSum: function (a) {
      return a + this.closureVal;
    }
  };
});

function insertAt(arr, lineNumber, value) {
  arr.splice(lineNumber, 0, value);
}

describe('Before tests.', function () {

  it('Before with no effect to result.', function () {
    var pureResult = patchTarget.sum(2, 2);
    expect(pureResult).equal(4);
    expect(patchTarget.property).deep.equal(bodyStrArr);
    patchTarget.property = [];

    function doItBefore(cb) {
      this.property.push(beforeStr);
    }

    new Monkey({
      obj: patchTarget,
      method: 'sum',
      before: doItBefore
    });

    var expectedArr = bodyStrArr.slice(0);
    insertAt(expectedArr, 0, beforeStr);

    var result = patchTarget.sum(2, 2);
    expect(result).equal(4);
    expect(patchTarget.property).deep.equal(expectedArr);
    patchTarget.property = [];
  });

  it('Make effect to result(closure).', function () {
    var pureResult = patchTarget.closureSum(2);
    expect(pureResult).equal(3);

    function doItBefore() {
      this.closureVal = 2
    }

    new Monkey({
      obj: patchTarget,
      method: 'closureSum',
      before: doItBefore
    });

    var result = patchTarget.closureSum(2, 2);
    expect(result).equal(4);
  });


  // it('Patch value from closure.', function () {
  //   var pureResult = patchTarget.sum(1, 1);
  //   expect(pureResult).equal(2);
  //   patchTarget.property = '';
  //
  //   var lineOneInjectionStr = 'this.property += \'-> injection on line 1\';';
  //   var lineFiveInjectionStr =
  //       'this.property += \'-> injection on line 5\';' +
  //       ' a += 1;\n' +
  //       'this.property += \'end of injection(5) ->\';';
  //
  //   var expectedStr;
  //   expectedStr = insertString(bodyStr, 5, lineFiveInjectionStr);
  //   expectedStr = insertString(expectedStr, 1, lineOneInjectionStr);
  //   expectedStr = insertString(expectedStr, 0, '!--before--!\n');
  //   expectedStr += '!--after---!\n';
  //
  //   function doItBefore(cb) {
  //     this.property += '!--before--!\n';
  //     //if (cb) cb();
  //   }
  //
  //   function doItAfter(cb) {
  //     this.property += '!--after---!\n';
  //     //if (cb) cb();
  //   }
  //
  //   new Monkey({
  //     obj: patchTarget,
  //     method: 'sum',
  //     before: doItBefore,
  //     after: doItAfter,
  //     1: lineOneInjectionStr,
  //     5: lineFiveInjectionStr
  //   });
  //
  //   //expect(patchTarget.property).equal(bodyStr);
  //   var patchedResult = patchTarget.sum(1, 1);
  //   expect(patchedResult).equal(3);
  //   console.log(patchTarget.property);
  //   expect(patchTarget.property).equal(expectedStr);
  // });
});
