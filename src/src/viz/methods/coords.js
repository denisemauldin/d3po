(() => {
  let filter;
  let process;

  filter = require('../../core/methods/filter.js');

  process = require('../../core/methods/process/data.js');

  module.exports = {
    accepted: [false, Array, Function, Object, String],
    center: [0, 0],
    filetype: {
      accepted: ['json'],
      value: 'json'
    },
    fit: {
      accepted: ['auto', 'height', 'width'],
      value: 'auto'
    },
    key: false,
    mute: filter(false),
    padding: 20,
    process: process,
    projection: {
      accepted: [
        'albers',
        'albersUsa',
        'azimuthalEqualArea',
        'azimuthalEquidistant',
        'conicConformal',
        'conicEqualArea',
        'conicEquidistant',
        'equirectangular',
        'gnomonic',
        'mercator',
        'orthographic',
        'stereographic',
        'transverseMercator',
        Function
      ],
      value: 'mercator'
    },
    simplify: {
      accepted: [Boolean],
      value: true
    },
    solo: filter(false),
    threshold: {
      accepted: [Number],
      value: 0.9
    },
    value: false
  };
}).call(this);
