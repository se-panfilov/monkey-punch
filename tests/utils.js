module.exports = {
  getFnArr (fn, delimiter){
    return fn.newMsg.toString().split(delimiter);
  },
  insertAtStr (str, lineNumber, value) {
    var arr = str.split('\n');
    arr[lineNumber] += value;
    return arr.join('\n')
  },
  insertAt (arr, lineNumber, value) {
    arr.splice(lineNumber, 0, value);
  },
  copyArr(arr) {
    return arr.slice(0);
  }
};