module.exports = {
  insertAtStr: function (str, lineNumber, value) {
    var arr = str.split('\n');
    arr[lineNumber] += value;
    return arr.join('\n')
  },
  insertAt: function (arr, lineNumber, value) {
    arr.splice(lineNumber, 0, value);
  },
  copyArr: function (arr) {
    return arr.slice(0);
  }
};