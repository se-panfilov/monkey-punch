Lib for [monkey-patching][https://en.wikipedia.org/wiki/Monkey_patch]. Not ready yet

Monkey-patching is a way to override or extend the behaviour of a method without changing its original source code.


Override
---------

What it does is this: it sends the original function into the callback function, and whatever that callback function returns, we replace the object’s method with it.

```
function override(object, methodName, callback) {
  object[methodName] = callback(object[methodName])
}
```

Decorators([more info][http://javascript.info/tutorial/decorators])
---------

After
---------

1. Call the original function;
2. Save its return value;
3. Do our work;
4. Return the saved return value;

```
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

Before
---------

```
function before(extraBehavior) {
  return function(original) {
    return function() {
      extraBehavior.apply(this, arguments)
      return original.apply(this, arguments)
    }
  }
}
```


Compose
---------

```
function compose(extraBehavior) {
  return function(original) {
    return function() {
      return extraBehavior.call(this, original.apply(this, arguments))
    }
  }
}
```

Benchmark
---------

```
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

Memoize
---------

```
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


------------------------------
Library based on this article: http://me.dt.in.th/page/JavaScript-override/ by Thai Pangsakulyanont (http://dt.in.th/)