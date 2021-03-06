(() => {
  let fetchColor;
  let fetchText;
  let fetchValue;

  fetchValue = require('./value.js');

  fetchColor = require('./color.js');

  fetchText = require('./text.js');

  module.exports = (vars, d, keys, colors, depth) => {
    let agg;
    let i;
    let key;
    let len;
    let obj;
    let value;
    if (!(keys instanceof Array)) {
      keys = [keys];
    }
    if (!(colors instanceof Array)) {
      colors = [colors];
    }
    if (vars) {
      if (depth === void 0) {
        depth = vars.id.value;
      } else if (typeof depth !== 'number') {
        depth = vars.id.nesting.indexOf(depth);
      }
    }
    obj = {};
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      if (vars) {
        if (colors.indexOf(key) >= 0) {
          value = fetchColor(vars, d, depth);
        } else if (key === vars.text.value) {
          value = fetchText(vars, d, depth);
        } else if (
          d3.keys(d).length === 3 &&
          d['d3po'] &&
          d['key'] &&
          d['values']
        ) {
          value = fetchValue(
            vars,
            d.values.map(dd => dd.d3po),
            key,
            depth
          );
        } else {
          value = fetchValue(vars, d, key, depth);
        }
      } else {
        value = d[key];
      }
      if ([vars.data.keys[key], vars.attrs.keys[key]].indexOf('number') >= 0) {
        agg = vars.order.agg.value || vars.aggs.value[key] || 'sum';
        if (agg.constructor === String) {
          agg = d3[agg];
        }
        if (!(value instanceof Array)) {
          value = [value];
        }
        value = agg(value);
      } else {
        if (value instanceof Array) {
          value = value[0];
        }
        value = typeof value === 'string' ? value.toLowerCase() : value;
      }
      obj[key] = value;
    }
    return obj;
  };
}).call(this);
