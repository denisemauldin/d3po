(() => {
  let fetchValue;

  fetchValue = require('../../../core/fetch/value.js');

  module.exports = (vars, d, segment) => {
    let ret;
    ret = vars[segment].value;
    if (ret) {
      if (segment in d.d3po) {
        return d.d3po[segment];
      } else {
        return fetchValue(vars, d, ret);
      }
    } else {
      return d.d3po[segment];
    }
  };
}).call(this);
