'use strict';

var expect = require('chai').expect;
var Monkey = require('../../src/index.js');
var Utils = require('../utils');

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

describe('Before tests.', function () {

  it('Before with no effect to result.', function () {
    var firstLine = 0;
    var expectedPureResult = 4;

    var pureResult = patchTarget.sum(2, 2);
    expect(pureResult).equal(expectedPureResult);
    expect(patchTarget.property).deep.equal(bodyStrArr);
    patchTarget.property = [];

    function doItBefore() {
      this.property.push(beforeStr);
    }

    new Monkey({
      obj: patchTarget,
      method: 'sum',
      before: doItBefore
    });

    var expectedArr = Utils.copyArr(bodyStrArr);
    Utils.insertAt(expectedArr, firstLine, beforeStr);

    var result = patchTarget.sum(2, 2);
    expect(result).equal(expectedPureResult);
    expect(patchTarget.property).deep.equal(expectedArr);
  });

  it('Make effect to result(closure).', function () {
    var expectedPureResult = 3;
    var expectedModifiedResult = 4;

    var pureResult = patchTarget.closureSum(2);
    expect(pureResult).equal(expectedPureResult);

    function doItBefore() {
      this.closureVal = 2
    }

    new Monkey({
      obj: patchTarget,
      method: 'closureSum',
      before: doItBefore
    });

    var result = patchTarget.closureSum(2);
    expect(result).equal(expectedModifiedResult);
  });

  it('Check restore after effect to result.', function () {
    var firstLine = 0;
    var expectedPureResult = 4;

    var pureResult = patchTarget.sum(2, 2);
    expect(pureResult).equal(expectedPureResult);
    expect(patchTarget.property).deep.equal(bodyStrArr);
    patchTarget.property = [];

    function doItBefore(cb) {
      this.property.push(beforeStr);
    }

    var monkey = new Monkey({
      obj: patchTarget,
      method: 'sum',
      before: doItBefore
    });

    var expectedArr = Utils.copyArr(bodyStrArr);
    Utils.insertAt(expectedArr, firstLine, beforeStr);

    var affectedResult = patchTarget.sum(2, 2);
    expect(affectedResult).equal(expectedPureResult);
    expect(patchTarget.property).deep.equal(expectedArr);
    patchTarget.property = [];

    monkey.restore();

    expect(typeof patchTarget.sum).equal('function');
    var restoredResult = patchTarget.sum(2, 2);
    expect(restoredResult).equal(expectedPureResult);
    expect(patchTarget.property).deep.equal(bodyStrArr);
  });
});
