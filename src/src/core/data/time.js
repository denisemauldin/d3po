// Determines visible time markers and formatting
(() => {
  let sizes;

  sizes = require('../../font/sizes.js');

  module.exports = (vars, opts) => {
    let f;
    let format;
    let func;
    let getFormat;
    let limit;
    let locale;
    let p;
    let periods;
    let pp;
    let prev;
    let render;
    let small;
    let step;
    let style;
    let time;
    let total;
    let vals;
    let values;
    values = opts.values || vars.data.time.ticks;
    style = opts.style || {};
    limit = opts.limit || vars.width.value;
    time = {};
    periods = vars.data.time.periods;
    step = vars.data.time.stepType;
    total = vars.data.time.totalType;
    func = vars.data.time.functions;
    getFormat = vars.data.time.getFormat;
    locale = vars.format.locale.value.format;
    if (vars.time.format.value) {
      time.format = vars.data.time.format;
      time.values = values;
      time.sizes = sizes(
        values.map(v => time.format(v)),
        style
      );
    } else {
      p = periods.indexOf(step);
      while (p <= periods.indexOf(total)) {
        vals = values.filter(t => {
          let match;
          let pp;
          if (p === periods.indexOf(step)) {
            return true;
          }
          match = true;
          pp = p - 1;
          if (p < 0) {
            return true;
          }
          while (pp >= periods.indexOf(step)) {
            if (!match) {
              break;
            }
            match = !func[pp](t);
            pp--;
          }
          return match;
        });
        if (periods[p] === total) {
          format = d3.locale(locale).timeFormat(getFormat(periods[p], total));
        } else {
          pp = p;
          format = [];
          while (pp <= periods.indexOf(total)) {
            prev = pp - 1 < periods.indexOf(step) ? pp : pp - 1;
            prev = periods[prev];
            small = periods[pp] === prev && step !== total;
            f = getFormat(prev, periods[pp], small);
            format.push([f, func[pp]]);
            pp++;
          }
          format[format.length - 1][1] = () => true;
          format = d3.locale(locale).timeFormat.multi(format);
        }
        render = sizes(
          vals.map(v => format(v)),
          style
        );
        if (
          d3.sum(render, r => r.width) < limit ||
          p === periods.indexOf(total)
        ) {
          time.format = format;
          time.values = vals;
          time.sizes = render;
          break;
        }
        p++;
      }
    }
    return time;
  };
}).call(this);
