Graceful Monkey-patching.
------

UNDER HEAVY CONSTRUCTION
----

[Monkey-patching][1] is a way to override or extend the behaviour of a method without changing its original source code.

### Override

```javascript
var myMonkey = new Monkey({
  obj: patchTarget,
  method: ['sum', 'min'],
  before: doItBefore, //only function here
  after: doItAfter, //should be called with same args as origin
  isLazy: false, // lazy allow you to not patch immediately
  body: {
    linesDelimiter: '\n',
    isEval: false, //option to use eval instead of new Function
    regexps: {
      '/\)\n/g': addSemiQuoteFn, // add ';' after each ')'
      '/\{/g': ' ' // add space before each'{'
    },
    positions: {
      1: '// injection to line one',
      5: '// injection to line five',
      2: lineTwoInjectionFunc,
      '6,10': '// Injection to line 6 column 10',
      '2,3': lineTwoColumnThreeInjectionFunc,
      '2,-1': '// Injection to line 2 column -1 (1 from lines end)'
    }
  }
});


//...
myMonkey.restore();
// ...
```

## References

Special thanks to [Thai Pangsakulyanont][4] and his [article][3].

## LICENSE

MIT: https://github.com/se-panfilov/monkey-punch/blob/master/LICENSE

[1]: https://en.wikipedia.org/wiki/Monkey_patch
[2]: http://javascript.info/tutorial/decorators
[3]: http://me.dt.in.th/page/JavaScript-override/
[4]: http://dt.in.th/
