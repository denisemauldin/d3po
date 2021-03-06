var child = require("../../../util/child.js"),
    closest = require("../../../util/closest.js"),
    createTooltip = require("../tooltip/create.js"),
    events = require("../../../client/pointer.js"),
    fetchValue = require("../../../core/fetch/value.js"),
    fetchColor = require("../../../core/fetch/color.js"),
    fetchText = require("../../../core/fetch/text.js"),
    legible = require("../../../color/legible.js"),
    print = require("../../../core/console/print.js"),
    removeTooltip = require("../../../tooltip/remove.js"),
    segments = require("./segments.js"),
    shapeFill = require("./fill.js"),
    stringStrip = require("../../../string/strip.js"),
    touch = require("../../../client/touch.js"),
    touchEvent = require("../zoom/propagation.js"),
    uniqueValues = require("../../../util/uniques.js"),
    validObject = require("../../../object/validate.js"),
    zoomDirection = require("../zoom/direction.js");

var drawShape = {
    "arc": require("./arc.js"),
    "area": require("./area.js"),
    "check": require("./check.js"),
    "coordinates": require("./coordinates.js"),
    "line": require("./line.js"),
    "radial": require("./radial.js"),
    "rect": require("./rect.js"),
    "whisker": require("./whisker.js")
};

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws the appropriate shape based on the data
//------------------------------------------------------------------------------
module.exports = function(vars) {

    var data = vars.returned.nodes || [],
        edges = vars.returned.edges || [];

    vars.draw.timing = data.length < vars.data.large &&
        edges.length < vars.edges.large ?
        vars.timing.transitions : 0;

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Match vars.shape types to their respective d3po.shape functions. For
    // example, both "square", and "circle" shapes use "rect" as their drawing
    // class.
    //----------------------------------------------------------------------------
    var shapeLookup = {
        "arc": "arc",
        "area": "area",
        "check": "check",
        "circle": "rect",
        "coordinates": "coordinates",
        "donut": "donut",
        "line": "line",
        "radial": "radial",
        "rect": "rect",
        "square": "rect",
        "whisker": "whisker"
    };

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Split the data by each shape type in the data.
    //----------------------------------------------------------------------------
    var shapes = {};
    data.forEach(function(d) {
        var s = d.d3po && d.d3po.shape ? d.d3po.shape : vars.shape.value;
        if (s in shapeLookup) {
            if (d.d3po) d.d3po.shape = s
            s = shapeLookup[s]
            if (!shapes[s]) shapes[s] = []
            shapes[s].push(d)
        }
    })

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Resets the "id" of each data point to use with matching.
    //----------------------------------------------------------------------------
    function id(d) {

        if (!d.d3po.id) {
            d.d3po.id = "";
            for (var i = 0; i <= vars.depth.value; i++) {
                d.d3po.id += fetchValue(vars, d, vars.id.nesting[i]) + "_"
            }

            d.d3po.id += shape;

            ["x", "y", "x2", "y2"].forEach(function(axis) {
                if (vars[axis].scale.value == "discrete") {
                    var val = fetchValue(vars, d, vars[axis].value)
                    if (val.constructor === Date) val = val.getTime()
                    d.d3po.id += "_" + val
                }
            })

            if (d.d3po.suffix) {
                d.d3po.id += "_" + d.d3po.suffix;
            }

            d.d3po.id = stringStrip(d.d3po.id)
        }

        return d
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Transforms the positions and scale of each group.
    //----------------------------------------------------------------------------
    function transform(g, grow) {

        var scales = vars.types[vars.type.value].scale,
            scale = 1;
        if (scales) {
            if (validObject[scales] && vars.shape.value in scales) {
                scale = scales[vars.shape.value];
            } else if (typeof scales == "function") {
                scale = scales(vars, vars.shape.value);
            } else if (typeof scales == "number") {
                scale = scales;
            }
        }

        scale = grow ? scale : 1;
        g.attr("transform", function(d) {

            if (["line", "area", "coordinates"].indexOf(shape) < 0) {
                var x = d.d3po.x || 0,
                    y = d.d3po.y || 0;
                return "translate(" + x + "," + y + ")scale(" + scale + ")";
            } else {
                return "scale(" + scale + ")";
            }

        });

    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Sets the class name for a group
    //----------------------------------------------------------------------------
    function className(g) {
        g
            .attr("id", function(d) {
                return "d3po_group_" + d.d3po.id;
            })
            .attr("class", function(d) {
                var c = vars.class.value ? " " + fetchValue(vars, d, vars.class.value) : "";
                return "d3po_" + shape + c;
            });
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Remove old groups
    //----------------------------------------------------------------------------
    for (var s in shapeLookup) {
        if (!(shapeLookup[s] in shapes) || d3.keys(shapes).length === 0) {
            var oldShapes = vars.g.data.selectAll("g.d3po_" + shapeLookup[s]);
            if (vars.draw.timing) {
                oldShapes
                    .transition().duration(vars.draw.timing)
                    .attr("opacity", 0)
                    .remove();
            } else {
                oldShapes
                    .remove();
            }
        }
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Initialize arrays for labels and sizes
    //----------------------------------------------------------------------------
    var labels = [],
        shares = [];

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Create groups by shape, apply data, and call specific shape drawing class.
    //----------------------------------------------------------------------------
    for (var shape in shapes) {

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Bind Data to Groups
        //--------------------------------------------------------------------------
        var selection = vars.g.data.selectAll("g.d3po_" + shape)
            .data(shapes[shape], function(d) {

                if (!d.d3po) d.d3po = {}

                if (shape === "coordinates") {
                    d.d3po.id = d.id
                    return d.id
                }

                if (!d.d3po.id) {

                    if (d.values) {

                        d.values.forEach(function(v) {
                            v = id(v)
                            v.d3po.shape = "circle"
                        })
                        d.d3po.id = d.key

                    } else {

                        d = id(d)

                    }

                }

                return d.d3po ? d.d3po.id : false;

            })

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Groups Exit
        //--------------------------------------------------------------------------
        if (vars.draw.timing) {
            var exit = selection.exit()
                .transition().duration(vars.draw.timing)
                .attr("opacity", 0)
                .remove()
        } else {
            var exit = selection.exit()
                .remove()
        }

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Existing Groups Update
        //--------------------------------------------------------------------------
        if (vars.draw.timing) {
            selection
                .transition().duration(vars.draw.timing)
                .call(transform)
                .call(className);
        } else {
            selection.call(transform).call(className);
        }

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Groups Enter
        //--------------------------------------------------------------------------
        var opacity = vars.draw.timing ? 0 : 1
        var enter = selection.enter().append("g")
            .attr("opacity", opacity)
            .call(transform)
            .call(className);

        if (vars.draw.timing) {
            enter.transition().duration(vars.draw.timing)
                .attr("opacity", 1)
        }

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // All Groups Sort Order
        //--------------------------------------------------------------------------
        selection.order()

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Draw appropriate graphics inside of each group
        //--------------------------------------------------------------------------
        if (vars.dev.value) print.time("drawing \"" + shape + "\" shapes")
        drawShape[shape](vars, selection, enter, exit, transform)
        if (vars.dev.value) print.timeEnd("drawing \"" + shape + "\" shapes")

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Check for active and temp fills for rects
        //--------------------------------------------------------------------------
        if (["rect"].indexOf(shape) >= 0 && vars.types[vars.type.value].fill) {
            if (vars.dev.value) print.time("filling \"" + shape + "\" shapes")
            shapeFill(vars, selection, enter, exit, transform)
            if (vars.dev.value) print.timeEnd("filling \"" + shape + "\" shapes")
        }

    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Function to Update Edges
    //----------------------------------------------------------------------------
    function edge_update(d) {

        if (d && vars.g.edges.selectAll("g").size() > 0) {

            vars.g.edge_hover
                .selectAll("*")
                .remove()

            vars.g.edges.selectAll("g")
                .each(function(l) {

                    var id = d[vars.id.value],
                        source = l[vars.edges.source][vars.id.value],
                        target = l[vars.edges.target][vars.id.value];

                    if (source == id || source == "left_" + id || source == "right_" + id ||
                        target == id || target == "left_" + id || target == "right_" + id) {
                        var elem = vars.g.edge_hover.node().appendChild(this.cloneNode(true))
                        d3.select(elem).datum(l).attr("opacity", 1)
                            .selectAll("line, path").datum(l)
                    }

                })


            var marker = vars.edges.arrows.value

            vars.g.edge_hover
                .attr("opacity", 0)
                .selectAll("line, path")
                .style("stroke", vars.color.primary)
                .style("stroke-width", function(d) {
                    if (vars.edges.path && d.dy) {
                        return Math.max(1, d.dy);
                    }
                    return vars.edges.size.value ? d3.select(this).style("stroke-width") :
                        vars.data.stroke.width * 2
                })
                .attr("marker-start", function(e) {

                    var direction = vars.edges.arrows.direction.value

                    if ("bucket" in e.d3po) {
                        var d = "_" + e.d3po.bucket
                    } else {
                        var d = ""
                    }

                    return direction == "source" && marker ?
                        "url(#d3po_edge_marker_highlight" + d + ")" : "none"

                })
                .attr("marker-end", function(e) {

                    var direction = vars.edges.arrows.direction.value

                    if ("bucket" in e.d3po) {
                        var d = "_" + e.d3po.bucket
                    } else {
                        var d = ""
                    }

                    return direction == "target" && marker ?
                        "url(#d3po_edge_marker_highlight" + d + ")" : "none"

                })


            vars.g.edge_hover.selectAll("text")
                .style("fill", vars.color.primary)

            if (vars.draw.timing) {

                vars.g.edge_hover
                    .transition().duration(vars.timing.mouseevents)
                    .attr("opacity", 1)

                vars.g.edges
                    .transition().duration(vars.timing.mouseevents)
                    .attr("opacity", 0.5)

            } else {

                vars.g.edge_hover
                    .attr("opacity", 1)

            }

        } else {

            if (vars.draw.timing) {

                vars.g.edge_hover
                    .transition().duration(vars.timing.mouseevents)
                    .attr("opacity", 0)
                    .transition()
                    .selectAll("*")
                    .remove()

                vars.g.edges
                    .transition().duration(vars.timing.mouseevents)
                    .attr("opacity", 1)

            } else {

                vars.g.edge_hover
                    .selectAll("*")
                    .remove()

            }

        }

    }

    edge_update()

    if (vars.tooltip.value) {

        vars.g.data.selectAll("g")
            .on(events.over, function(d) {

                if (touch) touchEvent(vars, d3.event);

                if (!d3.event.buttons && vars.mouse.value && vars.mouse.over.value && !vars.draw.frozen && (!d.d3po || !d.d3po.static)) {

                    var defaultClick = typeof vars.mouse.over.value !== "function";
                    if (typeof vars.mouse.over.value === "function") {
                        defaultClick = vars.mouse.over.value(d, vars.self);
                    }
                    if (defaultClick) {

                        var zoomDir = zoomDirection(d.d3po_data || d, vars)
                        var pointer = typeof vars.mouse.viz === "function" ||
                            typeof vars.mouse.viz[events.click] === "function" ||
                            (vars.zoom.value && (vars.types[vars.type.value].zoom ||
                                (d.d3po.threshold && d.d3po.merged) ||
                                zoomDir === 1 ||
                                (zoomDir === -1 && vars.history.states.length && !vars.tooltip.value.long)));

                        d3.select(this)
                            .style("cursor", pointer ? "pointer" : "auto")
                            .transition().duration(vars.timing.mouseevents)
                            .call(transform, true)

                        d3.select(this).selectAll(".d3po_data")
                            .transition().duration(vars.timing.mouseevents)
                            .attr("opacity", 1)

                        vars.covered = false

                        if (d.values && vars.axes.discrete) {

                            var index = vars.axes.discrete === "x" ? 0 : 1,
                                mouse = d3.mouse(vars.container.value.node())[index],
                                positions = uniqueValues(d.values, function(x) {
                                    return x.d3po[vars.axes.discrete]
                                }),
                                match = closest(positions, mouse)

                            d.d3po_data = d.values[positions.indexOf(match)]
                            d.d3po = d.values[positions.indexOf(match)].d3po

                        }

                        var tooltip_data = d.d3po_data ? d.d3po_data : d

                        createTooltip({
                            "vars": vars,
                            "data": tooltip_data
                        })

                        if (typeof vars.mouse.viz == "function") {
                            vars.mouse.viz(d.d3po_data || d, vars)
                        } else if (vars.mouse.viz[events.over]) {
                            vars.mouse.viz[events.over](d.d3po_data || d, vars)
                        }

                        edge_update(d)

                    }

                } else {
                    removeTooltip(vars.type.value);
                }

            })
            .on(events.move, function(d) {

                if (touch) touchEvent(vars, d3.event);

                if (!d3.event.buttons && vars.mouse.value && vars.mouse.move.value && !vars.draw.frozen && (!d.d3po || !d.d3po.static)) {

                    var defaultClick = typeof vars.mouse.move.value !== "function";
                    if (typeof vars.mouse.move.value === "function") {
                        defaultClick = vars.mouse.move.value(d, vars.self);
                    }
                    if (defaultClick) {

                        var zoomDir = zoomDirection(d.d3po_data || d, vars)
                        var pointer = typeof vars.mouse.viz === "function" ||
                            typeof vars.mouse.viz[events.click] === "function" ||
                            (vars.zoom.value && (vars.types[vars.type.value].zoom ||
                                (d.d3po.threshold && d.d3po.merged) ||
                                zoomDir === 1 ||
                                (zoomDir === -1 && vars.history.states.length && !vars.tooltip.value.long)));


                        d3.select(this).style("cursor", pointer ? "pointer" : "auto");

                        // vars.covered = false
                        var tooltipType = vars.types[vars.type.value].tooltip || "follow"

                        if (d.values && vars.axes.discrete) {

                            var index = vars.axes.discrete === "x" ? 0 : 1,
                                mouse = d3.mouse(vars.container.value.node())[index],
                                positions = uniqueValues(d.values, function(x) {
                                    return x.d3po[vars.axes.discrete]
                                }),
                                match = closest(positions, mouse)

                            d.d3po_data = d.values[positions.indexOf(match)]
                            d.d3po = d.values[positions.indexOf(match)].d3po

                        }

                        var tooltip_data = d.d3po_data ? d.d3po_data : d
                        createTooltip({
                            "vars": vars,
                            "data": tooltip_data
                        })

                        if (typeof vars.mouse.viz == "function") {
                            vars.mouse.viz(d.d3po_data || d, vars)
                        } else if (vars.mouse.viz[events.move]) {
                            vars.mouse.viz[events.move](d.d3po_data || d, vars)
                        }

                    }

                } else {
                    removeTooltip(vars.type.value);
                }

            })
            .on(events.out, function(d) {

                if (touch) touchEvent(vars, d3.event);

                if (!d3.event.buttons && vars.mouse.value && vars.mouse.out.value) {

                    var defaultClick = typeof vars.mouse.out.value !== "function";
                    if (typeof vars.mouse.out.value === "function") {
                        defaultClick = vars.mouse.out.value(d, vars.self);
                    }
                    if (defaultClick) {

                        var childElement = child(this, d3.event.toElement)

                        if (!childElement && !vars.draw.frozen && (!d.d3po || !d.d3po.static)) {

                            d3.select(this)
                                .transition().duration(vars.timing.mouseevents)
                                .call(transform)

                            d3.select(this).selectAll(".d3po_data")
                                .transition().duration(vars.timing.mouseevents)
                                .attr("opacity", vars.data.opacity)

                            if (!vars.covered) {
                                removeTooltip(vars.type.value)
                            }

                            if (typeof vars.mouse.viz == "function") {
                                vars.mouse.viz(d.d3po_data || d, vars)
                            } else if (vars.mouse.viz[events.out]) {
                                vars.mouse.viz[events.out](d.d3po_data || d, vars)
                            }

                            edge_update()

                        }

                    }

                } else {
                    removeTooltip(vars.type.value);
                }

            })

    } else {

        var mouseEvent = function() {
            touchEvent(vars, d3.event)
        }

        vars.g.data.selectAll("g")
            .on(events.over, mouseEvent)
            .on(events.move, mouseEvent)
            .on(events.out, mouseEvent)

    }

    d3.select(window).on("scroll.d3po", function() {
        removeTooltip(vars.type.value);
    });

    vars.g.data.selectAll("g")
        .on(events.click, function(d) {

            if (!(vars.mouse.viz && vars.mouse.viz.click === false) && vars.mouse.value && vars.mouse.click.value && !d3.event.defaultPrevented && !vars.draw.frozen && (!d.d3po || !d.d3po.static)) {

                var defaultClick = typeof vars.mouse.click.value !== "function";
                if (typeof vars.mouse.click.value === "function") {
                    defaultClick = vars.mouse.click.value(d, vars.self);
                }
                if (defaultClick) {

                    if (d.values && vars.axes.discrete) {

                        var index = vars.axes.discrete === "x" ? 0 : 1,
                            mouse = d3.mouse(vars.container.value.node())[index],
                            positions = uniqueValues(d.values, function(x) {
                                return x.d3po[vars.axes.discrete]
                            }),
                            match = closest(positions, mouse)

                        d.d3po_data = d.values[positions.indexOf(match)]
                        d.d3po = d.values[positions.indexOf(match)].d3po

                    }

                    if (typeof vars.mouse.viz == "function") {
                        vars.mouse.viz(d.d3po_data || d, vars)
                    } else if (vars.mouse.viz[events.out]) {
                        vars.mouse.viz[events.out](d.d3po_data || d, vars)
                    } else if (vars.mouse.viz[events.click]) {
                        vars.mouse.viz[events.click](d.d3po_data || d, vars)
                    }

                    var depth_delta = zoomDirection(d.d3po_data || d, vars),
                        previous = vars.id.solo.value,
                        title = fetchText(vars, d)[0],
                        color = legible(fetchColor(vars, d)),
                        prev_sub = vars.title.sub.value || false,
                        prev_color = vars.title.sub.font.color,
                        prev_total = vars.title.total.font.color

                    if (d.d3po.threshold && d.d3po.merged && vars.zoom.value) {

                        vars.history.states.push(function() {

                            vars.self
                                .id({
                                    "solo": previous
                                })
                                .title({
                                    "sub": {
                                        "font": {
                                            "color": prev_color
                                        },
                                        "value": prev_sub
                                    },
                                    "total": {
                                        "font": {
                                            "color": prev_total
                                        }
                                    }
                                })
                                .draw()

                        })

                        vars.self
                            .id({
                                "solo": previous.concat(uniqueValues(d.d3po.merged, vars.id.value, fetchValue, vars))
                            })
                            .title({
                                "sub": {
                                    "font": {
                                        "color": color
                                    },
                                    "value": title
                                },
                                "total": {
                                    "font": {
                                        "color": color
                                    }
                                }
                            })
                            .draw()

                    } else if (depth_delta === 1 && vars.zoom.value) {

                        var id = fetchValue(vars, d.d3po_data || d, vars.id.value)

                        vars.history.states.push(function() {

                            vars.self
                                .depth(vars.depth.value - 1)
                                .id({
                                    "solo": previous
                                })
                                .title({
                                    "sub": {
                                        "font": {
                                            "color": prev_color
                                        },
                                        "value": prev_sub
                                    },
                                    "total": {
                                        "font": {
                                            "color": prev_total
                                        }
                                    }
                                })
                                .draw()

                        })

                        vars.self
                            .depth(vars.depth.value + 1)
                            .id({
                                "solo": previous.concat(id)
                            })
                            .title({
                                "sub": {
                                    "font": {
                                        "color": color
                                    },
                                    "value": title
                                },
                                "total": {
                                    "font": {
                                        "color": color
                                    }
                                }
                            })
                            .draw()

                    } else if (depth_delta === -1 && vars.zoom.value &&
                        vars.history.states.length && !vars.tooltip.value.long) {

                        vars.history.back()

                    } else if (vars.types[vars.type.value].zoom && vars.zoom.value) {

                        edge_update()

                        d3.select(this)
                            .transition().duration(vars.timing.mouseevents)
                            .call(transform)

                        d3.select(this).selectAll(".d3po_data")
                            .transition().duration(vars.timing.mouseevents)
                            .attr("opacity", vars.data.opacity)

                        removeTooltip(vars.type.value)
                        vars.draw.update = false

                        if (!d || d[vars.id.value] == vars.focus.value[0]) {
                            vars.self.focus(false).draw()
                        } else {
                            vars.self.focus(d[vars.id.value]).draw()
                        }

                    } else if (vars.types[vars.type.value].requirements.indexOf("focus") < 0) {

                        edge_update()

                        var tooltip_data = d.d3po_data ? d.d3po_data : d

                        createTooltip({
                            "vars": vars,
                            "data": tooltip_data
                        })

                    }

                }

            }

        })

}
