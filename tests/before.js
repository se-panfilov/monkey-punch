'use strict';

var expect = require('chai').expect;
var monkKeyPatch = require('../dist/monk-key-patch.js');

var obj;

// var patchTarget = {
//   sum: function (a, b) {
//     console.log('-------Line: 0-------');
//     console.log('Line: 1');
//     console.log('Line: 2');
//     console.log('Line: 3');
//     console.log('sum! (line 4)');
//     console.log('-------Line: 5-------');
//     return a + b;
//   }
// };

// function doItBefore(cb) {
//   console.log('before');
//   //if (cb) cb();
// }
//
// function doItAfter(cb) {
//   console.log('after');
//   //if (cb) cb();
// }
//
// var sumMonkey = new Monkey({
//   obj: patchTarget,
//   method: 'sum',
//   before: doItBefore,
//   after: doItAfter,
//   1: 'console.log(\'-> injection on line 1\')',
//   5: 'console.log(\'-> injection on line 5\');\n a +=a; \n console.log(\'end of injection(5) ->\')'
// });
//
// sumMonkey.hack();
// var result = patchTarget.sum(1, 2);
// console.log('result:' + result);

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
