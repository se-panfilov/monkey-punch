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
    }
  };
});

describe('Before tests.', function () {
  it('Patch value from closure.', function () {

    monkKeyPatch.override(obj, 'closureVal', monkKeyPatch.before(function () {
      this.val = 1;
    }));

    var result = obj.closureVal();
    expect(result).equal(2);

  })
});
