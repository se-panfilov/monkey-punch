'use strict';

var expect = require('chai').expect;
var monkKeyPatch = require('../dist/monk-key-patch.js');

var obj;

beforeEach(function () {
  obj = {
    val: 0,
    closureVal: function () {
      var a = 1;
      return a + this.val;
    },
    sum: function (a, b) {
      this.val = a + b;
    }
  };
});

describe('After tests.', function () {
  it('Patch value from closure.', function () {
    obj.sum(1, 1);
    expect(obj.val).equal(2);

    monkKeyPatch.override(obj, 'sum', monkKeyPatch.after(function () {
      this.val += 1
    }));

    obj.sum(1, 1);
    expect(obj.val).equal(3);
  });
});
