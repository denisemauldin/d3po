// Finds closest value in array
(() => {
  module.exports = (arr, value) => {
    let closest;
    let i;
    if (value.constructor === String) {
      i = arr.indexOf(value);
      if (i > -1) {
        return arr[i];
      } else {
        return arr[0];
      }
    }
    closest = arr[0];
    arr.forEach(p => {
      if (Math.abs(value - p) < Math.abs(value - closest)) {
        return (closest = p);
      }
    });
    return closest;
  };
}).call(this);
