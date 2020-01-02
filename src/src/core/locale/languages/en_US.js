(function() {
    module.exports = {
        dev: {
            accepted:
        '{0} is not an accepted value for {1}, please use one of the following: {2}.',
            noChange: '{0} was not updated because it did not change.',
            noContainer: 'cannot find a container on the page matching {0}.',
            of: 'of',
            oldStyle:
        'style properties for {0} have now been embedded directly into .{1}().',
            sameEdge:
        'edges cannot link to themselves. automatically removing self-referencing edge {0}.',
            set: '{0} has been set.',
            setLong: '{0} has been set to {1}.',
            setContainer: 'please define a container div using .container()'
        },
        error: {
            accepted:
        '{0} is not an accepted {1} for {2} visualizations, please use one of the following: {3}.',
            connections: 'no connections available for {0}.',
            data: 'no data available',
            dataYear: 'no data available for {0}.',
            lib: '{0} visualizations require loading the {1} library.',
            libs: '{0} visualizations require loading the following libraries: {1}.',
            method: '{0} visualizations require setting the {1} method.',
            methods: '{0} visualizations require setting the following methods: {1}.'
        },
        format: {
            decimal: '.',
            thousands: ',',
            grouping: [3],
            currency: ['$', ''],
            dateTime: '%A, %B %-d, %Y %X',
            date: '%-m/%-d/%Y',
            time: '%I:%M:%S %p',
            periods: ['AM', 'PM'],
            days: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ],
            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            shortMonths: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ]
        },
        lowercase: [
            'a',
            'an',
            'and',
            'as',
            'at',
            'but',
            'by',
            'for',
            'from',
            'if',
            'in',
            'into',
            'near',
            'nor',
            'of',
            'on',
            'onto',
            'or',
            'per',
            'that',
            'the',
            'to',
            'with',
            'via',
            'vs',
            'vs.'
        ],
        message: {
            data: 'analyzing data',
            draw: 'drawing visualization',
            initializing: 'initializing {0}',
            loading: 'loading data',
            tooltipReset: 'resetting tooltips',
            ui: 'updating ui'
        },
        method: {
            active: 'active segments',
            color: 'color',
            depth: 'depth',
            dev: 'verbose',
            focus: 'focus',
            icon: 'icon',
            id: 'id',
            height: 'height',
            labels: 'labels',
            legend: 'legend',
            margin: 'margin',
            messages: 'status messages',
            mode: 'mode',
            mute: 'hide',
            order: 'order',
            search: 'search',
            shape: 'shape',
            size: 'size',
            solo: 'isolate',
            style: 'style',
            temp: 'temporary segments',
            text: 'text',
            time: 'time',
            timeline: 'timeline',
            total: 'total segments',
            type: 'type',
            width: 'width',
            x: 'x axis',
            y: 'y axis',
            zoom: 'zoom'
        },
        time: ['date', 'day', 'month', 'time', 'year'],
        timeFormat: {
            FullYear: '%Y',
            Month: '%B',
            MonthSmall: '%b',
            Date: '%A %-d',
            DateSmall: '%-d',
            Hours: '%I %p',
            Minutes: '%I:%M',
            Seconds: '%Ss',
            Milliseconds: '%Lms',
            'FullYear-Month': '%b %Y',
            'FullYear-Date': '%-m/%-d/%Y',
            'Month-Date': '%b %-d',
            'Hours-Minutes': '%I:%M %p',
            'Hours-Seconds': '%I:%M:%S %p',
            'Hours-Milliseconds': '%H:%M:%S.%L',
            'Minutes-Seconds': '%I:%M:%S %p',
            'Minutes-Milliseconds': '%H:%M:%S.%L',
            'Seconds-Milliseconds': '%H:%M:%S.%L'
        },
        ui: {
            and: 'and',
            back: 'back',
            collapse: 'click to collapse',
            error: 'error',
            expand: 'click to expand',
            including: 'including',
            iqr: 'interquartile range for {0}',
            loading: 'loading...',
            max: 'maximum',
            median: 'median',
            min: 'minimum',
            more: '{0} more',
            moreInfo: 'click for more info',
            or: 'or',
            noResults: 'no results matching {0}.',
            percentile: '{0} percentile',
            primary: 'primary connections',
            quartile_first: 'first quartile',
            quartile_third: 'third quartile',
            share: 'share',
            total: 'total',
            tukey_bottom: 'bottom tukey',
            tukey_top: 'top tukey',
            values: 'values'
        },
        uppercase: [
            'CEO',
            'CEOs',
            'CFO',
            'CFOs',
            'CNC',
            'COO',
            'COOs',
            'CPU',
            'CPUs',
            'ER',
            'GDP',
            'HVAC',
            'ID',
            'IT',
            'PCP',
            'R&D',
            'TV',
            'UI'
        ],
        visualization: {
            bar: 'Bar Chart',
            box: 'Box Plot',
            bubbles: 'Bubbles',
            chart: 'Chart',
            geomap: 'Geo Map',
            line: 'Line Plot',
            network: 'Network',
            paths: 'Paths',
            pie: 'Pie Chart',
            rings: 'Rings',
            scatter: 'Scatter Plot',
            stacked: 'Stacked Area',
            table: 'Table',
            treemap: 'Tree Map'
        }
    };
}.call(this));
