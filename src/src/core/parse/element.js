const hideElement = require('./hideelement.js');

// Parses an HTML element for data
module.exports = vars => {
  let attributes = [
    vars.color.value,
    vars.icon.value,
    vars.keywords.value,
    vars.alt.value,
    'style'
  ];

  if (!vars.text.value) {
    vars.self.text('text');
  }

  attributes = attributes.concat(vars.id.nesting);

  function get_attributes(obj, elem) {
    [].forEach.call(elem.attributes, attr => {
      if (/^data-/.test(attr.name)) {
        const camelCaseName = attr.name
          .substr(5)
          .replace(/-(.)/g, ($0, $1) => $1.toUpperCase());
        obj[camelCaseName] = attr.value;
      }
    });

    attributes.forEach(a => {
      if (elem.getAttribute(a) !== null) {
        obj[a] = elem.getAttribute(a);
      }
    });
  }

  vars.self.data({
    element: vars.data.value
  });

  const elementTag = vars.data.element.value.node().tagName.toLowerCase();
  const elementType = vars.data.element.value.attr('type');
  const elementData = [];

  if (elementTag === 'select') {
    const elementID = vars.data.element.value.node().id;
    if (elementID) {
      vars.self.container({
        id: elementID
      });
    }

    vars.data.element.value.selectAll('option').each(function(o, i) {
      const data_obj = {};

      data_obj.text = d3.select(this).text();

      get_attributes(data_obj, this);

      elementData.push(data_obj);

      if (this.selected) {
        for (i = vars.id.nesting.length - 1; i >= 0; i--) {
          const level = vars.id.nesting[i];
          if (level in data_obj) {
            vars.self.focus(data_obj[level]);
            break;
          }
        }
      }
    });
  } else if (elementTag === 'input' && elementType === 'radio') {
    const elementName = vars.data.element.value.node().getAttribute('name');
    if (elementName) {
      vars.self.container({
        id: elementName
      });
    }

    vars.data.element.value.each(function() {
      const data_obj = {};

      get_attributes(data_obj, this);

      const id = data_obj[vars.id.value] || this.id || false;

      if (id && isNaN(parseFloat(id))) {
        const label = d3.select('label[for=' + id + ']');

        if (!label.empty()) {
          data_obj.text = label.html();
          label.call(hideElement);
        }
      }

      elementData.push(data_obj);

      if (this.checked) {
        vars.self.focus(data_obj[vars.id.value]);
      }
    });
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Get focus from data, if it hasn't been found or set.
  //----------------------------------------------------------------------------
  if (!vars.focus.value.length && elementData.length) {
    vars.data.element.value.node().selectedIndex = 0;
    vars.self.focus(elementData[0][vars.id.value]);
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // If a <legend> element exists, use it as the title.
  //----------------------------------------------------------------------------
  const elementLegend = d3.select('legend[for=' + vars.container.id + ']');
  if (!elementLegend.empty()) {
    vars.self.title(elementLegend.html());
    elementLegend.call(hideElement);
  }

  const containerTag = vars.container.value
    ? vars.container.value.node().tagName.toLowerCase()
    : false;

  if (vars.container.value === false || containerTag === 'body') {
    vars.container.value = d3.select(vars.data.element.value.node().parentNode);
  }

  vars.data.element.value.call(hideElement);

  return elementData;
};
