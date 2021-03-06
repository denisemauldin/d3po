const fetchValue = require('../fetch/value.js');
const validObject = require('../../object/validate.js');
const uniqueValues = require('../../util/uniques.js');
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Nests and groups the data.
//------------------------------------------------------------------------------
const dataNest = (vars, flatData, nestingLevels, discrete) => {
  if (discrete === undefined) {
    discrete = true;
  }

  let nestedData = d3.nest();
  const groupedData = [];
  const segments = 'temp' in vars ? ['active', 'temp', 'total'] : [];

  if (!nestingLevels.length) {
    nestedData.key(() => true);
  } else {
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Loop through each nesting level.
    //----------------------------------------------------------------------------
    nestingLevels.forEach(level => {
      //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      // Create a nest key for the current level.
      //--------------------------------------------------------------------------
      nestedData.key(d => fetchValue(vars, d, level));
    });
  }

  if (
    discrete &&
    vars.axes &&
    vars.axes.discrete &&
    (!vars.time || vars[vars.axes.discrete].value !== vars.time.value)
  ) {
    nestedData.key(d => fetchValue(vars, d, vars[vars.axes.discrete].value));
  }

  const deepest_is_id =
    nestingLevels.length &&
    vars.id.nesting.indexOf(nestingLevels[nestingLevels.length - 1]) >= 0;
  const i =
    nestingLevels.length && deepest_is_id ? nestingLevels.length - 1 : 0;

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // If we're at the deepest level, create the rollup function.
  //----------------------------------------------------------------------------
  nestedData.rollup(leaves => {
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // If there's only 1 leaf, and it's been processed, return it as-is.
    //--------------------------------------------------------------------------
    if (leaves.length === 1 && 'd3po' in leaves[0]) {
      groupedData.push(leaves[0]);
      return leaves[0];
    }

    leaves = leaves.reduce((arr, ll) => {
      if (ll.values instanceof Array) {
        return arr.concat(ll.values);
      }
      arr.push(ll);
      return arr;
    }, []);

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Create the "d3po" object for the return variable, starting with
    // just the current depth.
    //--------------------------------------------------------------------------
    const returnObj = {
      d3po: {
        data: {},
        depth: i
      }
    };

    const merged = d3.sum(leaves, ll =>
      'd3po' in ll && ll.d3po.merged ? 1 : 0
    );

    if (merged === leaves.length) {
      for (let ll = 0; ll < leaves.length; ll++) {
        const l = leaves[ll];
        if (!returnObj.d3po.merged) {
          returnObj.d3po.merged = [];
        }
        returnObj.d3po.merged = returnObj.d3po.merged.concat(l.d3po.merged);
        if (l.d3po.text) {
          returnObj.d3po.text = l.d3po.text;
        }
      }
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Create a reference sum for the 3 different "segment" variables.
    //--------------------------------------------------------------------------
    for (let s = 0; s < segments.length; s++) {
      const c = segments[s];
      const segmentAgg =
        vars.aggs && vars.aggs.value[key] ? vars.aggs.value[key] : 'sum';

      if ('d3po' in leaves[0] && c in leaves[0].d3po) {
        returnObj.d3po[c] = d3.sum(leaves, d => d.d3po[c]);
      } else if (typeof segmentAgg === 'function') {
        returnObj.d3po[c] = segmentAgg(leaves);
      } else {
        returnObj.d3po[c] = d3[segmentAgg](leaves, d => {
          let a = c === 'total' ? 1 : 0;
          if (vars[c].value) {
            a = fetchValue(vars, d, vars[c].value);
            if (typeof a !== 'number') {
              a = a ? 1 : 0;
            }
          }
          return a;
        });
      }
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Aggregate all values detected in the data.
    //--------------------------------------------------------------------------
    for (var key in vars.data.keys) {
      if (key in returnObj.d3po.data) {
        returnObj[key] = returnObj.d3po[key];
      } else {
        const agg =
          vars.aggs && vars.aggs.value[key] ? vars.aggs.value[key] : 'sum';

        const aggType = typeof agg;
        const keyType = vars.data.keys[key];
        const idKey = vars.id.nesting.indexOf(key) >= 0;
        const timeKey = 'time' in vars && key === vars.time.value;

        if (key in returnObj.d3po.data) {
          returnObj[key] = returnObj.d3po[key];
        } else if (aggType === 'function') {
          returnObj[key] = vars.aggs.value[key](leaves);
        } else if (timeKey) {
          returnObj[key] = parseDates(uniqueValues(leaves, key));
        } else if (
          vars.axes &&
          vars.axes.discrete &&
          vars[vars.axes.discrete].value === key
        ) {
          returnObj[key] = uniqueValues(leaves, key);
        } else if (keyType === 'number' && aggType === 'string' && !idKey) {
          let vals = leaves.map(d => d[key]);
          vals = vals.filter(d => typeof d === keyType);
          if (vals.length) {
            returnObj[key] = d3[agg](vals);
          }
        } else {
          const testVals = checkVal(leaves, key);
          let keyValues =
            testVals.length === 1
              ? testVals[0][key]
              : uniqueValues(testVals, key);

          if (testVals.length === 1) {
            returnObj[key] = keyValues;
          } else if (keyValues && keyValues.length) {
            if (!(keyValues instanceof Array)) {
              keyValues = [keyValues];
            }

            if (idKey && vars.id.nesting.indexOf(key) > i) {
              // if (idKey && vars.id.nesting.indexOf(key) > i && keyValues.length > 1) {
              // if (nestingLevels.length == 1 && testVals.length > leaves.length) {
              //   var newNesting = nestingLevels.concat(key);
              //   testVals = dataNest(vars,testVals,newNesting);
              // }
              returnObj[key] = testVals;
            } else {
              returnObj[key] = keyValues;
            }
          } else if (idKey) {
            const endPoint = vars.id.nesting.indexOf(key) - 1;
            if (
              endPoint >= i &&
              (!('endPoint' in returnObj.d3po) || returnObj.d3po.endPoint > i)
            ) {
              returnObj.d3po.endPoint = i;
            }
          }
        }
      }

      if (
        key in returnObj &&
        returnObj[key] instanceof Array &&
        returnObj[key].length === 1
      ) {
        returnObj[key] = returnObj[key][0];
      }
    }

    for (let lll = 0; lll < nestingLevels.length; lll++) {
      const level = nestingLevels[lll];
      if (!(level in returnObj)) {
        returnObj[level] = fetchValue(vars, leaves[0], level);
      }
    }

    groupedData.push(returnObj);

    return returnObj;
  });

  const find_keys = (obj, depth, keys) => {
    if (obj.children) {
      if (vars.data.keys[nestingLevels[depth]] == 'number') {
        obj.key = parseFloat(obj.key);
      }
      keys[nestingLevels[depth]] = obj.key;
      delete obj.key;
      for (const k in keys) {
        obj[k] = keys[k];
      }
      depth++;
      obj.children.forEach(c => {
        find_keys(c, depth, keys);
      });
    }
  };

  nestedData = nestedData
    .entries(flatData)
    .map(rename_key_value)
    .map(obj => {
      find_keys(obj, 0, {});
      return obj;
    });

  return groupedData;
};

var checkVal = (leaves, key) => {
  const returnVals = [];

  function run(obj) {
    if (obj instanceof Array) {
      obj.forEach(run);
    } else if (validObject(obj) && key in obj) {
      if (obj[key] instanceof Array) {
        obj[key].forEach(run);
      } else {
        returnVals.push(obj);
      }
    }
  }

  run(leaves);

  return returnVals;
};

var parseDates = dateArray => {
  const dates = [];

  function checkDate(arr) {
    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      if (d) {
        if (d.constructor === Array) {
          checkDate(d);
        } else {
          dates.push(d);
        }
        // if (d.constructor === Date) dates.push(d);
        // else if (d.constructor === Array) {
        //   checkDate(d);
        // }
        // else {
        //   d = new Date(d.toString());
        //   if (d !== "Invalid Date") {
        //     d.setTime( d.getTime() + d.getTimezoneOffset() * 60 * 1000 );
        //     dates.push(d);
        //   }
        // }
      }
    }
  }

  checkDate(dateArray);

  return uniqueValues(dates);
};

var rename_key_value = obj => {
  if (obj.values && obj.values.length) {
    obj.children = obj.values.map(obj => rename_key_value(obj));
    delete obj.values;
    return obj;
  } else if (obj.values) {
    return obj.values;
  } else {
    return obj;
  }
};

module.exports = dataNest;
