'use strict';

var expect = require('chai').expect;
var Monkey = require('../src/index.js');

var patchTarget;

beforeEach(function () {
  patchTarget = {
    property: '',
    sum: function (a, b) {
      this.property += '-------Line: 0-------\n';
      this.property += 'Line: 1\n';
      this.property += 'Line: 2\n';
      this.property += 'Line: 3\n';
      this.property += 'sum! (line 4)\n';
      this.property += '-------Line: 5-------\n';
      return a + b;
    }
  };
});

describe('Before tests.', function () {
  it('Patch value from closure.', function () {
    expect(patchTarget.sum(1, 1)).equal(2);

    var lineOneInjectionStr = 'this.property += \'-> injection on line 1\';\n';
    var lineFiveInjectionStr =
        'this.property += \'-> injection on line 5\';\n' +
        ' a += 1;\n' +
        'this.property += \'end of injection(5) ->\';\n';

    function doItBefore(cb) {
      //TODO (S.Panfilov) add support of callbacks
      this.property += '!--before--!';
      //if (cb) cb();
    }

    function doItAfter(cb) {
      this.property += '!--after---!';
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

    expect(patchTarget.sum(1, 1)).equal(3);
  });
});
