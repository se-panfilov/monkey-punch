Lib for graceful Monkey-patching.

[Monkey-patching][1] is a way to override or extend the behaviour of a method without changing its original source code.

### Override

```javascript
new Monkey({
      obj: patchTarget,
      method: 'sum',
      before: doItBefore,
      after: doItAfter,
      1: lineOneInjectionStr,
      5: lineFiveInjectionStr
    });
```

## References

Special thanks to [Thai Pangsakulyanont][4] and his [article][3].

## LICENSE

MIT: https://github.com/se-panfilov/monk-key-patch/blob/master/LICENSE

[1]: https://en.wikipedia.org/wiki/Monkey_patch
[2]: http://javascript.info/tutorial/decorators
[3]: http://me.dt.in.th/page/JavaScript-override/
[4]: http://dt.in.th/
