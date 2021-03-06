const child = require('../../../../util/child.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Recursive function that applies a click event to all parent windows that
// will close the dropdown if it is open.
//------------------------------------------------------------------------------
const windowEvents = (vars, elem) => {
  if (elem === undefined) {
    elem = window;
  }

  d3.select(elem).on('click.' + vars.container.id, () => {
    let element = d3.event.target || d3.event.toElement;
    const parent = element.parentNode;

    if (
      parent &&
      ['d3po_node', 'd3po_drop_title'].indexOf(parent.className) >= 0
    ) {
      element = parent.parentNode;
    }

    if (
      element &&
      parent &&
      !child(vars.container.ui, element) &&
      (vars.open.value || vars.hover.value)
    ) {
      vars.self
        .open(false)
        .hover(false)
        .draw();
    }
  });

  let same_origin;
  try {
    same_origin = window.parent.location.host === window.location.host;
  } catch (e) {
    same_origin = false;
  }

  if (same_origin) {
    if (elem.self !== window.top) {
      windowEvents(vars, elem.parent);
    }
  }
};

module.exports = windowEvents;
