module.exports = {
  insertAt: function (arr, lineNumber, value) {
    arr.splice(lineNumber, 0, value);
  },
  copyArr: function (arr) {
    return arr.slice(0);
  }
};