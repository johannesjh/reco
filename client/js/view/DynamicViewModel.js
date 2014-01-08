define(['lib/knockout', 'constants/HistoryConstant', 'constants/MergeConstant',
    'constants/InputConstant', 'constants/NotificationConstant'], function (ko, HistoryConstant, MergeConstant, InputConstant, NotificationConstant) {

    function DynamicViewModel(inputIds, history, historyStrategy, mergeStrategy, notificationStrategy) {
        this.historyRepo = history;

        var self = this;
        inputIds.forEach(function (inputId) {
            self[inputId] = ko.observable();
            self[inputId + InputConstant.DISABLED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.SELECTED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.EDITABLE_POSTFIX] = ko.observable();
        });

        this.history = ko.observable();
        this.isHistoryByFieldVisible = ko.observable(historyStrategy === HistoryConstant.BY_OBJECT);
        this.isHistoryByUserVisible = ko.observable(historyStrategy === HistoryConstant.BY_USER);
        this.isHistoryByTimeVisible = ko.observable(historyStrategy === HistoryConstant.BY_TIME);
        this.isMultiMergeVisible = ko.observable(mergeStrategy === MergeConstant.MULTI);
        this.isNotificationBarVisible = ko.observable(notificationStrategy === NotificationConstant.BAR);
        this.isBubbleNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.BUBBLE);
        this.isObjectNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.OBJECT);
        this.fieldForHistory = ko.observable("");
        this.userForHistory = ko.observable("");
        this.users = ko.observable([]);

        this.notifications = ko.observableArray();

        this.toolTipTop = ko.observable();
        this.toolTipLeft = ko.observable();
        this.toolTipArrow = ko.observable();

        this.historyTop = ko.observable();
        this.historyLeft = ko.observable();

        this.isHistoryBoxVisible = ko.computed(function () {
            return !(self.isHistoryByFieldVisible() && self.fieldForHistory() == '');
        });

        this.barUser = ko.observable();
        this.barField = ko.observable();

        this.isBarInfoVisible = ko.computed(function () {
            return self.barUser() != null && self.barUser() != "";
        });

        this.isToolTipVisible = ko.observable(false);
    }

    DynamicViewModel.prototype.update = function (fieldId, value, markupValue) {
        this[fieldId](value);
        if (markupValue != null && markupValue.length > 0)
            this[fieldId + InputConstant.EDITABLE_POSTFIX](markupValue);
    };

    DynamicViewModel.prototype.lock = function (fieldId) {
        this[fieldId + InputConstant.DISABLED_POSTFIX](true);
    };

    DynamicViewModel.prototype.unlock = function (fieldId) {
        this[fieldId + InputConstant.DISABLED_POSTFIX](false);
    };

    DynamicViewModel.prototype.showHistoryByField = function (fieldId) {
        this.fieldForHistory(fieldId);
        this.history(this.historyRepo.getByField(fieldId));

        var rect;
        if (this.isMultiMergeVisible()) {
            rect = document.getElementById(fieldId + InputConstant.EDITABLE_POSTFIX).getBoundingClientRect();
        } else {
            rect = document.getElementById(fieldId).getBoundingClientRect();
        }

        this.historyTop(rect.top + window.scrollY - 27 + "px");
        this.historyLeft(rect.left + window.scrollX + rect.width + 25 + "px");
    };

    DynamicViewModel.prototype.showHistoryByUser = function (userId) {
        this.userForHistory(userId);
        this.history(this.historyRepo.getByUser(userId));

        var rect = document.getElementById(userId).getBoundingClientRect();

        this.historyTop(rect.top + window.scrollY + rect.height + 10 + "px");
        this.historyLeft(rect.left + window.scrollX + "px");
    };

    DynamicViewModel.prototype.scrollToFieldFromBar = function () {
        var elem;
        if (this.isMultiMergeVisible()) {
            elem = document.getElementById(this.barField() + InputConstant.EDITABLE_POSTFIX);
        } else {
            elem = document.getElementById(this.barField());
        }
        elem.scrollIntoView();
    };

    DynamicViewModel.prototype.scrollToFieldFromBubble = function (bubble) {
        var elem;
        if (this.isMultiMergeVisible()) {
            elem = document.getElementById(bubble.field + InputConstant.EDITABLE_POSTFIX);
        } else {
            elem = document.getElementById(bubble.field);
        }
        elem.scrollIntoView();
    };

    DynamicViewModel.prototype.scrollToFieldFromToolTip = function () {
        var elem;
        if (this.isMultiMergeVisible()) {
            elem = document.getElementById(this.barField() + InputConstant.EDITABLE_POSTFIX);
        } else {
            elem = document.getElementById(this.barField());
        }
        elem.scrollIntoView();

        this.isToolTipVisible(false);
    };

    return DynamicViewModel;
});