'use strict';

var expect = require('chai').expect;
var Monkey = require('../src/index.js');

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

describe('After tests.', function () {

  it('After with no effect to result.', function () {
    var pureResult = patchTarget.sum(2, 2);
    expect(pureResult).equal(4);
    expect(patchTarget.property).deep.equal(bodyStrArr);
    patchTarget.property = [];

    function doItAfter() {
      this.property.push(afterStr);
    }

    new Monkey({
      obj: patchTarget,
      method: 'sum',
      after: doItAfter
    });

    var expectedArr = bodyStrArr.slice(0);
    insertAt(expectedArr, 6, afterStr);

    var result = patchTarget.sum(2, 2);
    expect(result).equal(4);
    expect(patchTarget.property).deep.equal(expectedArr);
  });

  it('Make sure that no effect to result(closure).', function () {
    var pureResult = patchTarget.closureSum(2);
    expect(pureResult).equal(3);

    function doItAfter() {
      this.closureVal = 2
    }

    new Monkey({
      obj: patchTarget,
      method: 'closureSum',
      after: doItAfter
    });

    var result = patchTarget.closureSum(2);
    expect(result).equal(3);
  });

  it('Check restore after effect to result.', function () {
    //TODO (S.Panfilov) check this flow
    var pureResult = patchTarget.sum(2, 2);
    expect(pureResult).equal(4);
    expect(patchTarget.property).deep.equal(bodyStrArr);
    patchTarget.property = [];

    function doItAfter(cb) {
      this.property.push(afterStr);
    }

    var monkey = new Monkey({
      obj: patchTarget,
      method: 'sum',
      after: doItAfter
    });

    var expectedArr = bodyStrArr.slice(0);
    insertAt(expectedArr, 0, afterStr);

    var affectedResult = patchTarget.sum(2, 2);
    expect(affectedResult).equal(4);
    expect(patchTarget.property).deep.equal(expectedArr);

    monkey.restore();

    var restoredResult = patchTarget.sum(2, 2);
    expect(restoredResult).equal(4);
    expect(patchTarget.property).deep.equal(bodyStrArr);
  });
  
});
