'use strict';

var expect = require('chai').expect;
var monkKeyPatch = require('../dist/monk-key-patch.js');

var obj;

beforeEach(function () {
  obj = {
    some: function () {
      console.log(1);
    }
  };
});

describe('before.', function () {
  it('common test.', function () {

    var obj = {
      some: function () {
        console.log(1);
      }
    };

    monkKeyPatch.override(obj, 'some', monkKeyPatch.before(function () {
      console.log('monkey');
    }));

    obj.some();

  })
});
