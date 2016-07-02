'use strict';

var expect = require('chai').expect;
var Monkey = require('../../src/index.js');
var Utils = require('../utils');

var patchTarget;

beforeEach(function () {
  patchTarget = {
    executionCounter: 0,
    // sum: function (a, b) {
    //   'use strict';//Line 0
    //
    //   var line2 = 'Line 2';
    //   //Line 3
    //   var line4 = 'Line 4';
    //   var line5 = 'Line 5';
    //   var line6 = 'This is: ';//Line 6
    //   //Line 7
    //   var line8 = 'Line 8';
    //   //Line 9
    //   let line10 = /.*/g;
    //   const line11 = `Line 11 ${a + b}`;
    //   /*Line 12*/
    //   this.executionCounter += 1; //Line 13
    //
    //   return a + b; //line 15
    // },
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

    // describe('Check Inject Strings.', function () {
    //
    //   it('Inject at single line.', function () {
    //     var injectionValue = 'b += 1; //injection to line five(5)';
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
    //           5: injectionValue
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
    //     var injectionValue5 = 'a += 5; //injection to line five(5)';
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
    //           2: injectionValue2,
    //           5: injectionValue5,
    //           1: injectionValue1
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
    //     var expectedLine5 = (originFnArr[6] + injectionValue5).trim();
    //     expect(expectedLine1).to.be.equal(modifiedFnArr[2 + 1]);
    //     expect(expectedLine2).to.be.equal(modifiedFnArr[3 + 1]);
    //     expect(expectedLine5).to.be.equal(modifiedFnArr[6 + 1]);
    //   });
    //
    //   it('Inject line to too big line number.', function () {
    //
    //     var injectionValue = '//injection to line 999';
    //     var originFnArr = Utils.getFnArr(patchTarget.sum, '\n');
    //
    //     new Monkey({
    //       obj: patchTarget,
    //       method: 'sum',
    //       body: {
    //         positions: {
    //           2: 'some on 2',
    //           999: injectionValue,
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
    //
    //   });
    //
    // });

    describe('Check Inject at lines and columns.', function () {

      describe('Check Inject Strings.', function () {

        // it('Inject at single line and column.', function () {
        //   var injectionValue = ' b + ';//injection to line 15 column 7
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
        //         '15,7': injectionValue
        //       }
        //     }
        //   });
        //
        //   expect(patchTarget.executionCounter).to.be.equal(1);
        //
        //   var modifiedResult = patchTarget.sum(2, 3);
        //   var expectedResult = originResult + 3;
        //
        //   expect(patchTarget.executionCounter).to.be.equal(2);
        //   expect(modifiedResult).to.be.equal(expectedResult);
        //
        //   var modifiedFnArr = Utils.getFnArr(patchTarget.sum, '\n');
        //
        //   var expectedLine = originFnArr[16].trim().slice(0, 7) + injectionValue + originFnArr[16].trim().slice(7);
        //   expect(expectedLine).to.be.equal(modifiedFnArr[16 + 1]);
        // });
      });

      // it('Inject at multiple lines and columns.', function () {
      //  //TODO (S.Panfilov)
      // });

      // it('Inject line to too big line and column number.', function () {
      //
      //   new Monkey({
      //     obj: patchTarget,
      //     method: 'sum',
      //     body: {
      //       positions: {
      //         '999, 1999': '// injection to line (999,1999)'
      //       }
      //     }
      //   });
      //
      // });

    });
    //
    describe('Check Inject Functions.', function () {
      //
      //     it('Inject at single line and column.', function () {
      //
      //       function injectAtLineFiveColumnThree(cb) {
      //         var result = '// injection to line five(5), column three(3)';
      //         //TODO (S.Panfilov)
      //         cb();
      //         return result;
      //       }
      //
      //       new Monkey({
      //         obj: patchTarget,
      //         method: 'sum',
      //         body: {
      //           positions: {
      //             '5,3': injectAtLineFiveColumnThree
      //           }
      //         }
      //       });
      //
      //     });
      //
      it('Inject at multiple lines and columns.', function () {
        //The executing order should be like: '7,3', '7,2', '7,-1', '7,-2', '7', '6,2', '6,1', '6,0', '6,-1', '6,-2', '6',

        //Expected order:
        //     '7,8': 1,
        //     '7,10': 2,
        //     '7,12': 3,
        //     '7,-6': 4,
        //     '7,-4': 5,
        //     '7': 6,
        //
        //     '0,3': 0,
        //     '1,4': 1,
        //     '2,5': 2,
        //     '3,-3': 3,
        //     '4,-2': 4,
        //     '5,-1': 5,
        //     '6': '//6'

        new Monkey({
          obj: patchTarget,
          method: 'line',
          body: {
            //TODO (S.Panfilov) this should be in real test
            // positions: {
            //   '5,-1': 5,
            //   '4,-2': 4,
            //   '1,4': 1,
            //   '2,5': 2,
            //   '7,-4': 5,
            //   '7,8': 1,
            //   '7,-6': 4,
            //   '7': 6,
            //   '3,-3': 3,
            //   '7,12': 3,
            //   '6': '//6',
            //   '0,3': 0,
            //   '7,10': 2
            // }
            positions: {
              '7,12': 3, //return "____x____"//
              '7,10': 2, //return "__x__x____"//
              '7,8': 1, //return "x__x__x____"//
              '7,-3': 5, //return "x__x__x____x"//
              '7,-6': 4, //return "x__x__x__x__x"//
              '7': 6, //return "x__x__x__x__x"//x
              '6,12': 3, //return "____x____"//
              '6,10': 2, //return "__x__x____"//
              '6,8': 1, //return "x__x__x____"//
              '6,-3': 5, //return "x__x__x____x"//
              '6,-6': 4, //return "x__x__x__x__x"//
              '6': 6 //return "x__x__x__x__x"//x
            }
          }
        });

        //return "____x____"//
        //return "____3____"//

        var modifiedResult = patchTarget.line();
        var expectedResult = "1__2__3__4__5";

        //TODO (S.Panfilov) uncomment
        //expect(modifiedResult).to.be.equal(expectedResult);

        var modifiedFnArr = Utils.getFnArr(patchTarget.line, '\n');

        //TODO (S.Panfilov) uncomment
        // expect('//(0_)//').to.be.equal(modifiedFnArr[2]);
        // expect('//(_1)//').to.be.equal(modifiedFnArr[3]);
        // expect('//(_)2//').to.be.equal(modifiedFnArr[4]);
        // expect('//(_3)//').to.be.equal(modifiedFnArr[5]);
        // expect('//(_)4//').to.be.equal(modifiedFnArr[6]);
        // expect('//(_)/5/').to.be.equal(modifiedFnArr[7]);
        // expect('//(_)////6').to.be.equal(modifiedFnArr[8]);
        expect('return "1__2__3__4__5"//6').to.be.equal(modifiedFnArr[9]);


      });
      //
      //     it('Inject line to too big line and column number.', function () {
      //
      //       function injectAtLine999Column1999(cb) {
      //         var result = '// injection to line (999,1999)';
      //         //TODO (S.Panfilov)
      //         cb();
      //         return result;
      //       }
      //
      //       new Monkey({
      //         obj: patchTarget,
      //         method: 'sum',
      //         body: {
      //           positions: {
      //             '999, 1999': injectAtLine999Column1999
      //           }
      //         }
      //       });
      //
      //     });
      //
      //   });
      //
    });
    //
    // describe('Body all-in-one check.', function () {
    //
    //   it('Inject at single line and column.', function () {
    //
    //     function injectAtLineFour(cb) {
    //       var result = '// injection to line four(4)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineFive(cb) {
    //       var result = '// injection to line five(5)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineSix(cb) {
    //       var result = '// injection to line six(6)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineFiveColumnFive(cb) {
    //       var result = '// injection to line five(5), column five(5)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineSixColumnZero(cb) {
    //       var result = '// injection to line six(6), column zero(0)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineSixColumnOne(cb) {
    //       var result = '// injection to line six(6), column one(1)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineSixColumnTwo(cb) {
    //       var result = '// injection to line six(6), column two(2)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLine1024(cb) {
    //       var result = '// injection to line (1024)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLine666Column999(cb) {
    //       var result = '// injection to (666, 999)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLine666Column0(cb) {
    //       var result = '// injection to (666, 0)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     new Monkey({
    //       obj: patchTarget,
    //       method: 'sum',
    //       body: {
    //         positions: {
    //           '1,2': '// injection to line one(1) column two(2)',
    //           1: '// injection to line one(1)',
    //           '1,3': '// injection to line one(1) column three(3)',
    //           5: injectAtLineFive,
    //           '5,5': injectAtLineFiveColumnFive,
    //           '7,2': '// injection to line seven(7) column two(2)',
    //           '7,3': '// injection to line seven(7) column three(3)',
    //           '6,0': injectAtLineSixColumnZero,
    //           4: injectAtLineFour,
    //           '6,1': injectAtLineSixColumnOne,
    //           '6,2': injectAtLineSixColumnTwo,
    //           6: injectAtLineSix,
    //           1024: injectAtLine1024,
    //           '666,999': injectAtLine666Column999,
    //           '666,0': injectAtLine666Column0,
    //           1023: '// injection to line 1023',
    //           '777,888': '// injection to line (777,888)',
    //           '777,1': '// injection to line (777,1)'
    //         }
    //       }
    //     });
    //
    //   });
    //
    // });
    //
    // describe('Wrong keys checks.', function () {
    //
    //   it('Inject at multiple lines and columns.', function () {
    //
    //     function injectAtLineA(cb) {
    //       var result = '// injection to line A(A)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectionWithSpaceLine5Column5(cb) {
    //       var result = '// injection to line five(5), column five(5)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtColumnOne(cb) {
    //       var result = '// injection to BAD line, column one(1)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineSixColumnTwo(cb) {
    //       var result = '// injection to line six(6), column two(2)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     function injectAtLineSeven(cb) {
    //       var result = '// injection to line seven(7)';
    //       //TODO (S.Panfilov)
    //       cb();
    //       return result;
    //     }
    //
    //     new Monkey({
    //       obj: patchTarget,
    //       method: 'sum',
    //       body: {
    //         positions: {
    //           'a': injectAtLineA,
    //           'b': '// injection to line B(B)',
    //           '5, 5': injectionWithSpaceLine5Column5,
    //           '6, 0': '// injection to line siz(6), column zero(0)',
    //           ',1': injectAtColumnOne,
    //           ',2': '// injection to BAD line, column two(2)',
    //           '6.2': injectAtLineSixColumnTwo,
    //           '6.3': '// injection to line six(6), column three(3)',
    //           '7,': injectAtLineSeven,
    //           '8,': '// injection to line eight(6)'
    //         }
    //       }
    //     });
    //
    //   });

  });

  //==============================================================

  // new Monkey({
  //   obj: patchTarget,
  //   method: 'sum',
  //   body: {
  //     positions: {
  //       1: '// injection to line one(1)',
  //       5: '// injection to line five(5)',
  //       2: '// injection to line two(2)',
  //       '6,10': '// Injection to line 6 column 10',
  //       '2,3': lineTwoColumnThreeInjectionFunc
  //     }
  //   }
  // });

  //==============================================================

  // it('Patch value from closure.', function () {
  //   var pureResult = patchTarget.sum(1, 1);
  //   expect(pureResult).equal(2);
  //   patchTarget.property = '';
  //
  //   var lineOneInjectionStr = 'this.property += \'-> injection on line 1\';';
  //   var lineFiveInjectionStr =
  //       'this.property += \'-> injection on line 5\';' +
  //       ' a += 1;\n' +
  //       'this.property += \'end of injection(5) ->\';';
  //
  //   var expectedStr;
  //   expectedStr = insertString(bodyStr, 5, lineFiveInjectionStr);
  //   expectedStr = insertString(expectedStr, 1, lineOneInjectionStr);
  //   expectedStr = insertString(expectedStr, 0, '!--before--!\n');
  //   expectedStr += '!--after---!\n';
  //
  //   function doItBefore(cb) {
  //     this.property += '!--before--!\n';
  //     //if (cb) cb();
  //   }
  //
  //   function doItAfter(cb) {
  //     this.property += '!--after---!\n';
  //     //if (cb) cb();
  //   }
  //
  //   new Monkey({
  //     obj: patchTarget,
  //     method: 'sum',
  //     before: doItBefore,
  //     after: doItAfter,
  //     1: lineOneInjectionStr,
  //     5: lineFiveInjectionStr
  //   });
  //
  //   //expect(patchTarget.property).equal(bodyStr);
  //   var patchedResult = patchTarget.sum(1, 1);
  //   expect(patchedResult).equal(3);
  //   console.log(patchTarget.property);
  //   expect(patchTarget.property).equal(expectedStr);
  // });
});
