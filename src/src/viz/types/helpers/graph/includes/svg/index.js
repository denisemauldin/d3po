(() => {
  const tickPosition = require('./tickPosition');
  const tickStyle = require('./tickStyle');
  const xStyle = require('./xStyle');
  const yStyle = require('./yStyle');
  const userLines = require('./userLines');

  module.exports = vars => {
    let affixes;
    let axis;
    let axisData;
    let axisGroup;
    let axisLabel;
    let bg;
    let bgStyle;
    let domains;
    let grid;
    let gridData;
    let groupEnter;
    let j;
    let k;
    let l;
    let label;
    let labelData;
    let labelStyle;
    let len;
    let len1;
    let len2;
    let lines;
    let mirror;
    let opp;
    let plane;
    let planeTrans;
    let realData;
    let ref;
    let ref1;
    let ref2;
    let rotated;
    let sep;
    let style;
    domains = vars.x.domain.viz.concat(vars.y.domain.viz);
    if (domains.indexOf(void 0) >= 0) {
      return null;
    }
    bgStyle = {
      width: vars.axes.width,
      height: vars.axes.height,
      fill: vars.axes.background.color,
      stroke: vars.axes.background.stroke.color,
      'stroke-width': vars.axes.background.stroke.width,
      'shape-rendering': vars.axes.background.rendering.value
    };
    axisData = vars.small ? [] : [0];
    planeTrans =
      'translate(' +
      vars.axes.margin.viz.left +
      ',' +
      vars.axes.margin.viz.top +
      ')';
    plane = vars.group.selectAll('g#d3po_graph_plane').data([0]);
    plane
      .transition()
      .duration(vars.draw.timing)
      .attr('transform', planeTrans);
    plane
      .enter()
      .append('g')
      .attr('id', 'd3po_graph_plane')
      .attr('transform', planeTrans);
    bg = plane.selectAll('rect#d3po_graph_background').data([0]);
    bg.transition()
      .duration(vars.draw.timing)
      .attr(bgStyle);
    bg.enter()
      .append('rect')
      .attr('id', 'd3po_graph_background')
      .attr('x', 0)
      .attr('y', 0)
      .attr(bgStyle);
    mirror = plane.selectAll('path#d3po_graph_mirror').data([0]);
    mirror
      .enter()
      .append('path')
      .attr('id', 'd3po_graph_mirror')
      .attr('fill', '#000')
      .attr('fill-opacity', 0.03)
      .attr('stroke-width', 1)
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '10,10')
      .attr('opacity', 0);
    mirror
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', () => {
        if (vars.axes.mirror.value) {
          return 1;
        } else {
          return 0;
        }
      })
      .attr('d', () => {
        let h;
        let w;
        w = bgStyle.width;
        h = bgStyle.height;
        return 'M ' + w + ' ' + h + ' L 0 ' + h + ' L ' + w + ' 0 Z';
      });
    rotated = vars.x.ticks.rotate !== 0;
    ref = ['x', 'x2', 'y', 'y2'];
    for (j = 0, len = ref.length; j < len; j++) {
      axis = ref[j];
      style = axis.indexOf('x') === 0 ? xStyle(vars, rotated) : yStyle(vars);
      realData = axisData.length && vars[axis].value ? [0] : [];
      axisGroup = plane
        .selectAll('g#d3po_graph_' + axis + 'ticks')
        .data(realData);
      axisGroup
        .transition()
        .duration(vars.draw.timing)
        .call(style, axis);
      axisGroup
        .selectAll('line')
        .transition()
        .duration(vars.draw.timing)
        .call(tickStyle, axis, false, vars);
      groupEnter = axisGroup
        .enter()
        .append('g')
        .attr('id', 'd3po_graph_' + axis + 'ticks')
        .call(style, axis);
      groupEnter
        .selectAll('path')
        .attr('fill', 'none')
        .attr('stroke', 'none');
      groupEnter.selectAll('line').call(tickStyle, axis, false, vars);
      axisGroup
        .exit()
        .transition()
        .duration(vars.data.timing)
        .attr('opacity', 0)
        .remove();
    }
    labelStyle = (label, axis) =>
      label
        .attr(
          'x',
          axis.indexOf('x') === 0
            ? vars.width.viz / 2
            : -(vars.axes.height / 2 + vars.axes.margin.viz.top)
        )
        .attr(
          'y',
          axis === 'x'
            ? vars.height.viz -
                vars[axis].label.height / 2 -
                vars[axis].label.padding
            : axis === 'y2'
              ? vars.width.viz -
              vars[axis].label.height / 2 -
              vars[axis].label.padding
              : vars[axis].label.height / 2 + vars[axis].label.padding
        )
        .attr('transform', axis.indexOf('y') === 0 ? 'rotate(-90)' : null)
        .attr('font-family', vars[axis].label.font.family.value)
        .attr('font-weight', vars[axis].label.font.weight)
        .attr('font-size', vars[axis].label.font.size + 'px')
        .attr('fill', vars[axis].label.font.color)
        .style('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('text-transform', vars[axis].label.font.transform.value)
        .style('letter-spacing', vars[axis].label.font.spacing + 'px');
    ref1 = ['x', 'y'];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      axis = ref1[k];
      if (vars[axis].grid.value) {
        if (vars[axis].ticks.value) {
          gridData = vars[axis].ticks.value;
        } else {
          gridData = vars[axis].ticks.values;
        }
      } else {
        gridData = [];
        opp = axis === 'x' ? 'y' : 'x';
        if (vars[axis].ticks.values.indexOf(0) >= 0 && vars[opp].axis.value) {
          gridData = [0];
        }
      }
      if (vars[axis].value === vars.time.value) {
        gridData = gridData.map(d => {
          d += '';
          if (d.length === 4 && parseInt(d) + '' === d) {
            d += '/01/01';
          }
          return new Date(d).getTime();
        });
      }
      grid = plane.selectAll('g#d3po_graph_' + axis + 'grid').data([0]);
      grid
        .enter()
        .append('g')
        .attr('id', 'd3po_graph_' + axis + 'grid');
      lines = grid.selectAll('line').data(gridData, d => {
        if (d.constructor === Date) {
          return d.getTime();
        } else {
          return d;
        }
      });
      lines
        .transition()
        .duration(vars.draw.timing)
        .call(tickPosition, axis, vars)
        .call(tickStyle, axis, true, vars);
      lines
        .enter()
        .append('line')
        .style('opacity', 0)
        .call(tickPosition, axis, vars)
        .call(tickStyle, axis, true, vars)
        .transition()
        .duration(vars.draw.timing)
        .delay(vars.draw.timing / 2)
        .style('opacity', 1);
      lines
        .exit()
        .transition()
        .duration(vars.draw.timing / 2)
        .style('opacity', 0)
        .remove();
    }
    ref2 = ['x', 'x2', 'y', 'y2'];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      axis = ref2[l];
      if (vars[axis].value) {
        axisLabel = vars[axis].label.fetch(vars);
        labelData = axisData && axisLabel && !vars.small ? [0] : [];
        affixes = vars.format.affixes.value[vars[axis].value];
        if (axisLabel && !vars[axis].affixes.value && affixes) {
          sep = vars[axis].affixes.separator.value;
          if (sep === true) {
            sep = ['[', ']'];
          } else if (sep === false) {
            sep = ['', ''];
          }
          axisLabel += ' ' + sep[0] + affixes[0] + ' ' + affixes[1] + sep[1];
        }
      } else {
        axisLabel = '';
        labelData = [];
      }
      label = vars.group
        .selectAll('text#d3po_graph_' + axis + 'label')
        .data(labelData);
      label
        .text(axisLabel)
        .transition()
        .duration(vars.draw.timing)
        .call(labelStyle, axis);
      label
        .enter()
        .append('text')
        .attr('stroke', 'none')
        .attr('id', 'd3po_graph_' + axis + 'label')
        .text(axisLabel)
        .call(labelStyle, axis);
      label
        .exit()
        .transition()
        .duration(vars.data.timing)
        .attr('opacity', 0)
        .remove();
    }
    userLines(vars, plane);
  };
}).call(this);
