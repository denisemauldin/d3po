// Creates focus tooltip, if applicable
(() => {
  let createTooltip;
  let fetchValue;
  let print;
  let removeTooltip;

  createTooltip = require('../tooltip/create.js');

  fetchValue = require('../../../core/fetch/value.js');

  print = require('../../../core/console/print.js');

  removeTooltip = require('../../../tooltip/remove.js');

  module.exports = vars => {
    let data;
    let focus;
    let offset;
    focus = vars.focus;
    if (
      !vars.error.internal &&
      focus.value.length === 1 &&
      focus.value.length &&
      !vars.small &&
      focus.tooltip.value
    ) {
      if (vars.dev.value) {
        print.time('drawing focus tooltip');
      }
      data = vars.data.pool.filter(
        d => fetchValue(vars, d, vars.id.value) === focus.value[0]
      );
      if (data.length >= 1) {
        data = data[0];
      } else {
        data = {};
        data[vars.id.value] = focus.value[0];
      }
      offset = vars.labels.padding;
      createTooltip({
        anchor: 'top left',
        arrow: false,
        data: data,
        fullscreen: false,
        id: 'visualization_focus',
        length: 'long',
        maxheight: vars.height.viz - offset * 2,
        mouseevents: true,
        offset: 0,
        vars: vars,
        width: vars.tooltip.large,
        x: vars.width.value - vars.margin.right - offset,
        y: vars.margin.top + offset
      });
      vars.width.viz -= vars.tooltip.large + offset * 2;
      if (vars.dev.value) {
        print.timeEnd('drawing focus tooltip');
      }
    } else {
      removeTooltip('visualization_focus');
    }
  };
}).call(this);
