function override(object, methodName, callback) {
  object[methodName] = callback(object[methodName])
}

function after(extraBehavior) {
  return function(original) {
    return function() {
      var returnValue = original.apply(this, arguments)
      extraBehavior.apply(this, arguments)
      return returnValue
    }
  }
}

function before(extraBehavior) {
  return function(original) {
    return function() {
      extraBehavior.apply(this, arguments)
      return original.apply(this, arguments)
    }
  }
}

function compose(extraBehavior) {
  return function(original) {
    return function() {
      return extraBehavior.call(this, original.apply(this, arguments))
    }
  }
}

function benchmark(original) {
  return function() {
    var startTime = new Date().getTime()
    var returnValue = original.apply(this, arguments)
    var finishTime = new Date().getTime()
    console.log('Took', finishTime - startTime, 'ms.')
    return returnValue
  }
}

// XXX: Work only with functions with 1 argument.
function memoize(original) {
  var memo = { }
  return function(x) {
    if (Object.prototype.hasOwnProperty.call(memo, x)) return memo[x]
    memo[x] = original.call(this, x)
    return memo[x]
  }
}
