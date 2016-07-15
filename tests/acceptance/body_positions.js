'use strict';

var expect = require('chai').expect;
var Monkey = require('../../src/index.js');
var Utils = require('../utils');

var patchTarget;

beforeEach(function () {
  patchTarget = {
    executionCounter: 0,
    sum: function (a, b) {
      'use strict';//Line 0

      var line2 = 'Line 2';
      //Line 3
      var line4 = 'Line 4';
      var line5 = 'Line 5';
      var line6 = 'This is: ';//Line 6
      //Line 7
      var line8 = 'Line 8';
      //Line 9
      let line10 = /.*/g;
      const line11 = `Line 11 ${a + b}`;
      //////////////////////////////////
      this.executionCounter += 1; //Line 13

      return a + b; //line 15
    },
    line: function () {
      //(_)//
      //(_)//
      //(_)//
      //(_)//
      //(_)//
      //(_)//
      //(_)//
      return "________"//
    },
    oneLiner: function (a, b) {
      return 'OneLinerSum: ' + a + b;
    }// this function should be a single line
  };
});

describe('Body, modify at positions tests.', function () {

  describe('Check Inject at lines.', function () {

    describe('Check Inject Strings.', function () {

      it('Inject at single line.', function () {
        var injectionValue = 'b += 1; //injection to line five(5)';
        var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');

        expect(patchTarget.executionCounter).to.be.equal(0);
        var originResult = patchTarget.sum(2, 3); //5
        expect(patchTarget.executionCounter).to.be.equal(1);
        expect(originResult).to.be.equal(5);

        new Monkey({
          obj: patchTarget,
          method: 'sum',
          body: {
            positions: {
              5: injectionValue
            }
          }
        });

        expect(patchTarget.executionCounter).to.be.equal(1);

        var modifiedResult = patchTarget.sum(2, 3);
        var expectedResult = originResult + 1;

        expect(patchTarget.executionCounter).to.be.equal(2);
        expect(modifiedResult).to.be.equal(expectedResult);

        var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');

        var expectedLine = (originFnArr[6] + injectionValue).trim();
        expect(expectedLine).to.be.equal(modifiedFnArr[6 + 1]);
      });

      // it('Inject at multiple lines.', function () {
      //   var injectionValue1 = 'a += 3; //injection to line one(1)';
      //   var injectionValue2 = 'a *= 2; //injection to line two(2)';
      //   var injectionValue5 = 'a += 5; //injection to line five(5)';
      //
      //   var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
      //
      //   expect(patchTarget.executionCounter).to.be.equal(0);
      //   var originResult = patchTarget.sum(2, 3); //5
      //   expect(patchTarget.executionCounter).to.be.equal(1);
      //   expect(originResult).to.be.equal(5);
      //
      //   new Monkey({
      //     obj: patchTarget,
      //     method: 'sum',
      //     body: {
      //       positions: {
      //         2: injectionValue2,
      //         '5': injectionValue5,
      //         1: injectionValue1
      //       }
      //     }
      //   });
      //
      //   expect(patchTarget.executionCounter).to.be.equal(1);
      //
      //   var modifiedResult = patchTarget.sum(2, 3);
      //   var expectedResult = ((2 + 3) * 2) + 5 + 3; //18
      //
      //   expect(patchTarget.executionCounter).to.be.equal(2);
      //   expect(modifiedResult).to.be.equal(expectedResult);
      //
      //   var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
      //
      //   var expectedLine1 = (originFnArr[2] + injectionValue1).trim();
      //   var expectedLine2 = (originFnArr[3] + injectionValue2).trim();
      //   var expectedLine5 = (originFnArr[6] + injectionValue5).trim();
      //   expect(expectedLine1).to.be.equal(modifiedFnArr[2 + 1]);
      //   expect(expectedLine2).to.be.equal(modifiedFnArr[3 + 1]);
      //   expect(expectedLine5).to.be.equal(modifiedFnArr[6 + 1]);
      // });
      //
      // it('Inject line to too big line number.', function () {
      //
      //   var injectionValue = '//injection to line 999';
      //   var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
      //
      //   new Monkey({
      //     obj: patchTarget,
      //     method: 'sum',
      //     body: {
      //       positions: {
      //         2: 'some on 2',
      //         999: injectionValue,
      //         1: 'some on one - 1'
      //       }
      //     }
      //   });
      //
      //   // var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
      //   //
      //   // var expectedLine = originFnArr[6] + injectionValue;
      //   // expect(expectedLine).to.be.equal(modifiedFnArr[6 + 1]);
      //
      //   //TODO (S.Panfilov) fix required: should handle properly error
      //
      // });
      //
      // it('Inject at multiple lines and columns (check injection order).', function () {
      //   //The executing order should be like: '7,3', '7,2', '7,-2', '7,-1', '7', '6,2', '6,1', '6,0', '6,-2', '6,-1', '6',
      //
      //   new Monkey({
      //     obj: patchTarget,
      //     method: 'line',
      //     body: {
      //       positions: {
      //         '7,12': 3, //return "____x____"//
      //         '7,10': 2, //return "__x__x____"//
      //         '7,8': 1, //return "x__x__x____"//
      //         '7,-5': 4, //return "x__x__x__x__"//
      //         '7,-3': 5, //return "x__x__x__x__x"//
      //         '7': 6, //return "x__x__x__x__x"//x
      //         '6,3': 3, //(x_)//
      //         '6,2': 2, //x(x_)//
      //         '6,0': '//1', //x//x(x_)//
      //         '6,-3': 4, //x//x(x_x)//
      //         '6,-2': 5, //x//x(x_x)x//
      //         '6': 6 //x//x(x_x)x//x
      //       }
      //     }
      //   });
      //
      //   var modifiedResult = patchTarget.line();
      //   var expectedResult = "1__2__3__4__5";
      //
      //   expect(modifiedResult).to.be.equal(expectedResult);
      //
      //   var modifiedFnArr = Utils.getFnArr(patchTarget.line, '\n');
      //
      //   expect('//1//2(3_4)5//6').to.be.equal(modifiedFnArr[8]);
      //   expect('return "1__2__3__4__5"//6').to.be.equal(modifiedFnArr[9]);
      //
      //   var otherPatchTarget = {
      //     otherLine: function () {
      //       //(_)//
      //       //(_)//
      //       //(_)//
      //       //(_)//
      //       //(_)//
      //       //(_)//
      //       //(_)//
      //       return "________"//
      //     }
      //   };
      //
      //   //Same modifiers in different order
      //   new Monkey({
      //     obj: otherPatchTarget,
      //     method: 'otherLine',
      //     body: {
      //       positions: {
      //         '6,3': 3, //(x_)//
      //         '6,2': 2, //x(x_)//
      //         '7,12': 3, //return "____x____"//
      //         '6,-3': 4, //x//x(x_x)//
      //         '7,10': 2, //return "__x__x____"//
      //         '7,-5': 4, //return "x__x__x__x__"//
      //         '6': 6, //x//x(x_x)x//x
      //         '6,0': '//1', //x//x(x_)//
      //         '7': 6, //return "x__x__x__x__x"//x
      //         '7,-3': 5, //return "x__x__x__x__x"//
      //         '7,8': 1, //return "x__x__x____"//
      //         '6,-2': 5 //x//x(x_x)x//
      //       }
      //     }
      //   });
      //
      //   var otherModifiedResult = otherPatchTarget.otherLine();
      //   expect(otherModifiedResult).to.be.equal(modifiedResult);
      //
      //   var otherModifiedFnArr = Utils.getFnArr(patchTarget.line, '\n');
      //
      //   expect('//1//2(3_4)5//6').to.be.equal(otherModifiedFnArr[8]);
      //   expect('return "1__2__3__4__5"//6').to.be.equal(otherModifiedFnArr[9]);
      //
      //
      // });

    });

    // describe('Check Inject Functions.', function () {
    //
    //   it('Inject at single line.', function () {
    //
    //     var injectionValue = 'b += 1; //injection to line five(5)';
    //
    //     function injectAtLineFive(cb) {
    //       return injectionValue;
    //     }
    //
    //     var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //     expect(patchTarget.executionCounter).to.be.equal(0);
    //     var originResult = patchTarget.sum(2, 3); //5
    //     expect(patchTarget.executionCounter).to.be.equal(1);
    //     expect(originResult).to.be.equal(5);
    //
    //     new Monkey({
    //       obj: patchTarget,
    //       method: 'sum',
    //       body: {
    //         positions: {
    //           5: injectAtLineFive
    //         }
    //       }
    //     });
    //
    //     expect(patchTarget.executionCounter).to.be.equal(1);
    //
    //     var modifiedResult = patchTarget.sum(2, 3);
    //     var expectedResult = originResult + 1;
    //
    //     expect(patchTarget.executionCounter).to.be.equal(2);
    //     expect(modifiedResult).to.be.equal(expectedResult);
    //
    //     var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //     var expectedLine = (originFnArr[6] + injectionValue).trim();
    //     expect(expectedLine).to.be.equal(modifiedFnArr[6 + 1]);
    //   });
    //
    //   it('Inject at multiple lines.', function () {
    //     var injectionValue1 = 'a += 3; //injection to line one(1)';
    //     var injectionValue2 = 'a *= 2; //injection to line two(2)';
    //     var injectionValue5_part1 = 'a += 5;';
    //     var injectionValue5_part2 = '//injection to line five(5)';
    //
    //     function injectAtLineOne() {
    //       return injectionValue1;
    //     }
    //
    //     function injectAtLineTwo() {
    //       return injectionValue2;
    //     }
    //
    //     function injectAtLineFive() {
    //       return injectionValue5_part1 + injectionValue5_part2;
    //     }
    //
    //     var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //     expect(patchTarget.executionCounter).to.be.equal(0);
    //     var originResult = patchTarget.sum(2, 3); //5
    //     expect(patchTarget.executionCounter).to.be.equal(1);
    //     expect(originResult).to.be.equal(5);
    //
    //     new Monkey({
    //       obj: patchTarget,
    //       method: 'sum',
    //       body: {
    //         positions: {
    //           2: injectAtLineTwo,
    //           5: injectAtLineFive,
    //           1: injectAtLineOne
    //         }
    //       }
    //     });
    //
    //     expect(patchTarget.executionCounter).to.be.equal(1);
    //
    //     var modifiedResult = patchTarget.sum(2, 3);
    //     var expectedResult = ((2 + 3) * 2) + 5 + 3; //18
    //
    //     expect(patchTarget.executionCounter).to.be.equal(2);
    //     expect(modifiedResult).to.be.equal(expectedResult);
    //
    //     var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //     var expectedLine1 = (originFnArr[2] + injectionValue1).trim();
    //     var expectedLine2 = (originFnArr[3] + injectionValue2).trim();
    //     var expectedLine5 = (originFnArr[6] + injectionValue5_part1 + injectionValue5_part2).trim();
    //     expect(expectedLine1).to.be.equal(modifiedFnArr[2 + 1]);
    //     expect(expectedLine2).to.be.equal(modifiedFnArr[3 + 1]);
    //     expect(expectedLine5).to.be.equal(modifiedFnArr[6 + 1]);
    //
    //   });
    //
    //   it('Inject line to too big line number.', function () {
    //
    //     var injectionValue = '//injection to line 999';
    //
    //     function injectAtLine999(cb) {
    //       return injectionValue;
    //     }
    //
    //     var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //     new Monkey({
    //       obj: patchTarget,
    //       method: 'sum',
    //       body: {
    //         positions: {
    //           2: 'some on 2',
    //           999: injectAtLine999,
    //           1: 'some on one - 1'
    //         }
    //       }
    //     });
    //
    //     // var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //     //
    //     // var expectedLine = originFnArr[6] + injectionValue;
    //     // expect(expectedLine).to.be.equal(modifiedFnArr[6 + 1]);
    //
    //     //TODO (S.Panfilov) fix required: should handle properly error
    //
    //   });
    //
    // });
    //
    // describe('Check Inject at lines and columns.', function () {
    //
    //   describe('Check Inject Strings.', function () {
    //
    //     it('Inject at single line and column.', function () {
    //       var injectionValue = ' b + ';//injection to line 15 column 7
    //       var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //       expect(patchTarget.executionCounter).to.be.equal(0);
    //       var originResult = patchTarget.sum(2, 3); //5
    //       expect(patchTarget.executionCounter).to.be.equal(1);
    //       expect(originResult).to.be.equal(5);
    //
    //       new Monkey({
    //         obj: patchTarget,
    //         method: 'sum',
    //         body: {
    //           positions: {
    //             '15,7': injectionValue
    //           }
    //         }
    //       });
    //
    //       expect(patchTarget.executionCounter).to.be.equal(1);
    //
    //       var modifiedResult = patchTarget.sum(2, 3);
    //       var expectedResult = originResult + 3;
    //
    //       expect(patchTarget.executionCounter).to.be.equal(2);
    //       expect(modifiedResult).to.be.equal(expectedResult);
    //
    //       var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //       var expectedLine = originFnArr[16].trim().slice(0, 7) + injectionValue + originFnArr[16].trim().slice(7);
    //       expect(expectedLine).to.be.equal(modifiedFnArr[16 + 1]);
    //     });
    //   });
    //
    //   it('Inject line to too big line and column number.', function () {
    //
    //     var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //     new Monkey({
    //       obj: patchTarget,
    //       method: 'sum',
    //       body: {
    //         positions: {
    //           '999, 1999': '// injection to line (999,1999)'
    //         }
    //       }
    //     });
    //
    //     // var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //     //
    //     // var expectedLine = originFnArr[6] + injectionValue;
    //     // expect(expectedLine).to.be.equal(modifiedFnArr[6 + 1]);
    //
    //     //TODO (S.Panfilov) fix required: should handle properly error
    //   });
    //
    // });
  });
});
