const print = require('../../../../core/console/print.js');
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Toggles the state of the dropdown menu.
//------------------------------------------------------------------------------
module.exports = vars => {
  if (vars.dev.value) {
    print.time('rotating arrow');
  }

  const offset = vars.icon.drop.value === '&#x276f;' ? 90 : 0;

  let rotate;
  if (vars.open.value != vars.open.flipped.value) {
    rotate = 180 + offset;
  } else {
    rotate = offset;
  }

  vars.container.button
    .icon({
      select: {
        opacity: vars.open.value ? 0.5 : 1,
        rotate: rotate
      }
    })
    .draw();

  if (vars.dev.value) {
    print.timeEnd('rotating arrow');
  }
};
