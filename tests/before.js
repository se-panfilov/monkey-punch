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
    expect(obj.closureVal()).equal(1);

    // monkKeyPatch.override(obj, 'closureVal', monkKeyPatch.before(function () {
    //   this.val = 1;
    // }));
    //
    // expect(obj.closureVal()).equal(2);
  });
});
