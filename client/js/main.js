require(['lib/knockout', 'Connector', 'Brain', 'History', 'Messenger', 'constants/MergeConstant', 'constants/HistoryConstant',
    'constants/NotificationConstant', 'view/ConfigViewModel', 'view/DynamicViewModel', 'utils/getValues', 'utils/parseUrlParams',
    'UrlJuggler', 'utils/generateId', 'lib/domReady'], function (ko, Connector, Brain, History, Messenger, MergeConstant, HistoryConstant, NotificationConstant, ConfigViewModel, DynamicViewModel, getValues, parseUrlParams, UrlJuggler, generateId) {

    var INPUT_PREFIX = 'input';
    var INPUT_DISABLED_POSTFIX = 'Disabled';
    var INPUT_SELECTED_POSTFIX = 'Selected';

    var URL = location.origin;

    var connector = new Connector();
    var brain = new Brain();
    var history = new History();
    var messenger = new Messenger();
    var urlJuggler = new UrlJuggler(location.pathname, window.history.pushState.bind(window.history));
    var urlParams = parseUrlParams(location.search);


    var mergeParam = urlParams['merge'];
    var mergeStrategy = mergeParam !== undefined ? mergeParam : MergeConstant.PLAIN;
    var historyParam = urlParams['history'];
    var historyStrategy = historyParam !== undefined ? historyParam : HistoryConstant.BY_TIME;
    var notifyParam = urlParams['notification'];
    var notificationStrategy = notifyParam !== undefined ? notifyParam : NotificationConstant.BUBBLE;

    var configView = new ConfigViewModel(getValues(MergeConstant), getValues(HistoryConstant),
        getValues(NotificationConstant),
        mergeStrategy, historyStrategy, notificationStrategy, urlParams['user']);

    var userName = urlParams['user'];

    if (userName !== undefined) {
        brain.clientId = userName;
    }

    var inputIds = [];
    var inputs = document.querySelectorAll('input[id*=' + INPUT_PREFIX + ']');
    for (var i = 0; i < inputs.length; i++) {
        inputIds.push(inputs[i].id);

        (function (key) {
            inputs[i].addEventListener('keyup', function (event) {
                var data = {
                    client: brain.clientId,
                    id: generateId(),
                    field: key,
                    value: this.value
                };

                history.add(data);
                connector.send(data);
                view.historyByTime(history.getByTime());

            }, false);
        })(inputs[i].id)
    }

    var view = new DynamicViewModel(INPUT_DISABLED_POSTFIX, INPUT_SELECTED_POSTFIX, inputIds);

    ko.applyBindings(configView, document.getElementById('config'));
    ko.applyBindings(view, document.getElementById('mainView'));

    var mergeSubscription = configView.merge.subscribe(function (newVal) {
        if (newVal === undefined) {
            newVal = MergeConstant.PLAIN;
        }
        urlParams['merge'] = newVal;
        urlJuggler.updateParams(urlParams);
        mergeStrategy = newVal;
    });

    var historySubscription = configView.history.subscribe(function (newVal) {
        if (newVal === undefined) {
            newVal = HistoryConstant.BY_TIME;
        }
        urlParams['history'] = newVal;
        urlJuggler.updateParams(urlParams);
    });

    var notificationSubscription = configView.notification.subscribe(function (newVal) {
        if (newVal === undefined) {
            newVal = NotificationConstant.BUBBLE;
        }
        urlParams['notification'] = newVal;
        urlJuggler.updateParams(urlParams);
    });

    var userSubscription = configView.user.subscribe(function (newVal) {
        if (newVal === undefined || newVal === null || newVal.trim() === '') {
            newVal = 'pikatchu';
        }

        urlParams['user'] = newVal;
        urlJuggler.updateParams(urlParams);
        brain.clientId = newVal;
        configView.user(newVal);
    });

    var isInputVar = function (key) {
        return key.toUpperCase().indexOf(INPUT_PREFIX.toUpperCase()) !== -1 &&
            key.toUpperCase().indexOf(INPUT_DISABLED_POSTFIX.toUpperCase()) === -1 &&
            key.toUpperCase().indexOf(INPUT_SELECTED_POSTFIX.toUpperCase()) === -1
    };

    var isSelectVar = function (key) {
        return key.toUpperCase().indexOf(INPUT_PREFIX.toUpperCase()) !== -1 &&
            key.toUpperCase().indexOf(INPUT_DISABLED_POSTFIX.toUpperCase()) === -1 &&
            key.toUpperCase().indexOf(INPUT_SELECTED_POSTFIX.toUpperCase()) !== -1;
    };

    var subscriptionDict = {};
    Object.getOwnPropertyNames(view).forEach(function (key) {

        if (isSelectVar(key)) {
            subscriptionDict[key] = view[key].subscribe(function (newVal) {

                if (mergeStrategy == MergeConstant.LOCK) {

                    var data = {
                        client: brain.clientId,
                        field: key.slice(0, -INPUT_SELECTED_POSTFIX.length)
                    };

                    if (newVal) {
                        connector.lock(data);
                    } else {
                        connector.unlock(data);
                    }
                }
            });
        }
    });

    connector.connect(URL);

    connector.socket.on('info', function (data) {
        brain.register(data, configView.user);
    });

    connector.socket.on('update', function (data) {
        history.add(data);
        view.update(data.field, data.value);

        var historyData;
        if (historyStrategy === HistoryConstant.BY_TIME) {
            historyData = history.getByTime();
        } else if (historyStrategy === HistoryConstant.BY_OBJECT) {

        } else if (historyStrategy === HistoryConstant.BY_USER) {

        }
        view.historyByTime(historyData);
    });

    connector.socket.on('unlock', function (data) {
        view.unlock(data.field);
    });

    connector.socket.on('lock', function (data) {
        view.lock(data.field);
    });

    //todo nxt steps:
    //dann history by time -> user -> object
    //dann multi merge
    //dann notifications

});