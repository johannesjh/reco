define(['lib/knockout', 'TextToken', 'constants/HistoryConstant', 'constants/MergeConstant',
    'constants/InputConstant'], function (ko, TextToken, HistoryConstant, MergeConstant, InputConstant) {

    function DynamicViewModel(inputIds, history, historyStrategy, mergeStrategy) {
        this.historyRepo = history;

        var self = this;
        inputIds.forEach(function (inputId) {
            self[inputId] = ko.observable();
            self[inputId + InputConstant.DISABLED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.SELECTED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.VALUES_POSTFIX] = ko.observableArray([new TextToken(-1, "", false)]);
        });

        this.history = ko.observable();
        this.isHistoryByFieldVisible = ko.observable(historyStrategy === HistoryConstant.BY_OBJECT);
        this.isHistoryByUserVisible = ko.observable(historyStrategy === HistoryConstant.BY_USER);
        this.isMultiMergeVisible = ko.observable(mergeStrategy === MergeConstant.MULTI);
        this.fieldForHistory = "";
        this.userForHistory = "";
        this.users = ko.observable([]);
    }

    DynamicViewModel.prototype.update = function (fieldId, value, tokenValues) {
        this[fieldId](value);

        if (tokenValues != null) {
            var self = this;
            JSON.parse(tokenValues).forEach(function (token) {
                var list = self[fieldId + InputConstant.VALUES_POSTFIX]();
                var tokenNotInList = true;
                var length = list.length;
                for (var i=0; i <  length; i++) {
                    var elem = list[i];
                    if (elem.id === token.id) {
                        tokenNotInList = false;
                        elem.value(token.value);
                        break;
                    }
                }
                if (tokenNotInList)
                    list.push(new TextToken(token.id, token.value, token.active));
            });
        }
    };

    DynamicViewModel.prototype.lock = function (fieldId) {
        this[fieldId + InputConstant.DISABLED_POSTFIX](true);
    };

    DynamicViewModel.prototype.unlock = function (fieldId) {
        this[fieldId + InputConstant.DISABLED_POSTFIX](false);
    };

    DynamicViewModel.prototype.showHistoryByField = function (fieldId) {
        this.fieldForHistory = fieldId;
        this.history(this.historyRepo.getByField(fieldId));
    };

    DynamicViewModel.prototype.showHistoryByUser = function (userId) {
        this.userForHistory = userId;
        this.history(this.historyRepo.getByUser(userId));
    };

    return DynamicViewModel;
});