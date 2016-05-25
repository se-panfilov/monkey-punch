Lib for greceful Monkey-patching.

[Monkey-patching][1] is a way to override or extend the behaviour of a method without changing its original source code.

### Override

What it does: it sends the original function into the callback function, and whatever that callback function returns, we replace the object’s method with it.

```javascript
function override(object, methodName, callback) {
  object[methodName] = callback(object[methodName])
}
```

## Decorators

[More info][2] about decorators

### After

1. Call the original function;
2. Save its return value;
3. Do our work;
4. Return the saved return value;

```javascript
function after(extraBehavior) {
  return function(original) {
    return function() {
      var returnValue = original.apply(this, arguments)
      extraBehavior.apply(this, arguments)
      return returnValue
    }
  }
}
```

### Before

```javascript
function before(extraBehavior) {
  return function(original) {
    return function() {
      extraBehavior.apply(this, arguments)
      return original.apply(this, arguments)
    }
  }
}
```


### Compose

```javascript
function compose(extraBehavior) {
  return function(original) {
    return function() {
      return extraBehavior.call(this, original.apply(this, arguments))
    }
  }
}
```

### Benchmark

```javascript
function benchmark(original) {
  return function() {
    var startTime = new Date().getTime()
    var returnValue = original.apply(this, arguments)
    var finishTime = new Date().getTime()
    console.log('Took', finishTime - startTime, 'ms.')
    return returnValue
  }
}
```

### Memoize

```javascript
// XXX: Work only with functions with 1 argument.
function memoize(original) {
  var memo = { }
  return function(x) {
    if (Object.prototype.hasOwnProperty.call(memo, x)) return memo[x]
    memo[x] = original.call(this, x)
    return memo[x]
  }
}
```

## References

Library based on [this article][3] by [Thai Pangsakulyanont][4].

## LICENSE

MIT: https://github.com/se-panfilov/monk-key-patch/blob/master/LICENSE

[1]: https://en.wikipedia.org/wiki/Monkey_patch
[2]: http://javascript.info/tutorial/decorators
[3]: http://me.dt.in.th/page/JavaScript-override/
[4]: http://dt.in.th/
