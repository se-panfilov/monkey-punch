'use strict';

var expect = require('chai').expect;
var Monkey = require('../../src/index.js');
var Utils = require('../utils');

var patchTarget;
var bodyStrArr;
var afterStr = '!--after---!';

beforeEach(function () {
  bodyStrArr = [
    '-------Line: 0-------',
    'Line: 1',
    'Line: 2',
    'Line: 3',
    'Line: 4',
    '-------Line: 5-------'
  ];

  var closureVal = 1;

  patchTarget = {
    property: [],
    sum: function (a, b) {
      this.property.push('-------Line: 0-------');
      this.property.push('Line: 1');
      this.property.push('Line: 2');
      this.property.push('Line: 3');
      this.property.push('Line: 4');
      this.property.push('-------Line: 5-------');
      console.log(a);
      console.log(b);
      console.log(closureVal);
      return a + b + closureVal;
    },
    closureSum: function (a) {
      return a + closureVal;
    }
  };
});

describe('After tests.', function () {

  it('After with no effect to result.', function () {
    var lastLine = bodyStrArr.length;
    var expectedPureResult = 5;

    // var pureResult = patchTarget.sum(2, 2);
    // expect(pureResult).equal(expectedPureResult);
    // expect(patchTarget.property).deep.equal(bodyStrArr);
    // patchTarget.property = [];

    function doItAfter() {
      patchTarget.property.push(afterStr);
    }

    // new Monkey({
    //   obj: patchTarget,
    //   method: 'sum',
    //   after: doItAfter
    // });

    // var expectedArr = Utils.copyArr(bodyStrArr);
    // Utils.insertAt(expectedArr, lastLine, afterStr);

    //var result = patchTarget.sum(2, 2);
    // expect(result).equal(expectedPureResult);
    // expect(patchTarget.property).deep.equal(expectedArr);
  });

  // it('Make sure that no effect to result(closure).', function () {
  //   var expectedPureResult = 3;
  //
  //   var pureResult = patchTarget.closureSum(2);
  //   expect(pureResult).equal(expectedPureResult);
  //
  //   function doItAfter() {
  //     this.closureVal = 2
  //   }
  //
  //   new Monkey({
  //     obj: patchTarget,
  //     method: 'closureSum',
  //     after: doItAfter
  //   });
  //
  //   var result = patchTarget.closureSum(2);
  //   expect(result).equal(expectedPureResult);
  // });

  // it('Check restore after effect to result.', function () {
  //   var expectedPureResult = 4;
  //   var lastLine = bodyStrArr.length;
  //
  //   var pureResult = patchTarget.sum(2, 2);
  //   expect(pureResult).equal(expectedPureResult);
  //   expect(patchTarget.property).deep.equal(bodyStrArr);
  //   patchTarget.property = [];
  //
  //   function doItAfter() {
  //     this.property.push(afterStr);
  //   }
  //
  //   var monkey = new Monkey({
  //     obj: patchTarget,
  //     method: 'sum',
  //     after: doItAfter
  //   });
  //
  //   var expectedArr = Utils.copyArr(bodyStrArr);
  //   Utils.insertAt(expectedArr, lastLine, afterStr);
  //
  //   var affectedResult = patchTarget.sum(2, 2);
  //   expect(affectedResult).equal(expectedPureResult);
  //   expect(patchTarget.property).deep.equal(expectedArr);
  //   patchTarget.property = [];
  //
  //   monkey.restore();
  //
  //   expect(typeof patchTarget.sum).equal('function');
  //   var restoredResult = patchTarget.sum(2, 2);
  //   expect(restoredResult).equal(expectedPureResult);
  //   expect(patchTarget.property).deep.equal(bodyStrArr);
  // });

});
