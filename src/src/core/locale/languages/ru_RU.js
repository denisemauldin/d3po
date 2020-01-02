module.exports = {
    format: {
        decimal: ',',
        thousands: '\xa0',
        grouping: [3],
        currency: ['', ' руб.'],
        dateTime: '%A, %e %B %Y г. %X',
        date: '%d.%m.%Y',
        time: '%H:%M:%S',
        periods: ['AM', 'PM'],
        days: [
            'воскресенье',
            'понедельник',
            'вторник',
            'среда',
            'четверг',
            'пятница',
            'суббота'
        ],
        shortDays: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        months: [
            'января',
            'февраля',
            'марта',
            'апреля',
            'мая',
            'июня',
            'июля',
            'августа',
            'сентября',
            'октября',
            'ноября',
            'декабря'
        ],
        shortMonths: [
            'янв',
            'фев',
            'мар',
            'апр',
            'май',
            'июн',
            'июл',
            'авг',
            'сен',
            'окт',
            'ноя',
            'дек'
        ]
    },
    error: {
        accepted:
      '{0} не является обслуживаемым {1} для {2} визуализаций, пожалуйста, используйте одно из следующих действий: {3}.',
        connections: 'нет соединений, доступных для {0}.',
        data: 'данные недоступны',
        dataYear: 'нет данных для {0}.',
        lib: '{0} визуализаций требуют загрузки {1} библиотеки.',
        libs: '{0} визуализаций требует загрузки следующие библиотеки: {1}.',
        method: '{0} визуализаций требуют установки {1} метод.',
        methods: '{0} визуализаций требуют установки следующих методов: {1}.'
    },
    lowercase: [
        'и',
        'как',
        'в',
        'но',
        'для',
        'из',
        'если в',
        'в',
        'недалеко',
        'ни',
        'на',
        'на',
        'или',
        'в',
        'что',
        'к',
        'с',
        'с помощью',
        'против',
        'против'
    ],
    method: {
        active: 'активные сегменты',
        color: 'цвет',
        depth: 'глубина',
        dev: 'подробный',
        focus: 'фокус',
        icon: 'значок',
        id: 'Я бы',
        height: 'высота',
        labels: 'надписи',
        legend: 'легенда',
        margin: 'поле',
        messages: 'сообщения о состоянии',
        order: 'заказ',
        search: 'поиск',
        shape: 'форма',
        size: 'размер',
        style: 'стиль',
        temp: 'временные сегменты',
        text: 'текст',
        time: 'время',
        timeline: 'график',
        total: 'всего сегментов',
        type: 'тип',
        width: 'ширина',
        x: 'ось х',
        y: 'ось Y',
        zoom: 'масштаб',
        mode: 'Режим',
        mute: 'скрывать',
        solo: 'изолировать'
    },
    time: ['дата', 'день недели', 'месяц', 'время', 'год'],
    visualization: {
        bubbles: 'Пузыри',
        chart: 'Диаграмма',
        geomap: 'Карта Geo',
        line: 'линия Участок',
        network: 'сеть',
        rings: 'Кольца',
        scatter: 'Scatter Plot',
        stacked: 'Stacked Площадь',
        treemap: 'Дерево Карта',
        bar: 'гистограмма',
        box: 'Box Участок',
        paths: 'пути',
        pie: 'Круговая диаграмма',
        table: 'Таблица'
    },
    ui: {
        and: 'а также',
        back: 'назад',
        collapse: 'нажмите, чтобы свернуть',
        error: 'ошибка',
        expand: 'нажмите, чтобы развернуть',
        loading: 'загрузка ...',
        more: '{0} более',
        moreInfo: 'нажмите для получения дополнительной информации',
        noResults: 'нет результатов, соответствующих {0}.',
        primary: 'первичные соединения',
        share: 'доля',
        total: 'Всего',
        values: 'значения',
        including: 'в том числе',
        or: 'или',
        iqr: 'межквартильный диапазон для {0}',
        max: 'максимальная',
        min: 'минимальный',
        percentile: '{0} процентиль',
        tukey_bottom: 'нижний Тьюки',
        tukey_top: 'сверху Тьюки',
        quartile_first: 'первый квартиль',
        quartile_third: 'третий квартиль',
        median: 'медиана'
    },
    message: {
        data: 'данные анализа',
        draw: 'рисование визуализация',
        initializing: 'инициализацией {0}',
        loading: 'Загрузка данных',
        tooltipReset: 'сброс всплывающих подсказок',
        ui: 'обновление пользовательского интерфейса'
    },
    uppercase: ['ID']
};
