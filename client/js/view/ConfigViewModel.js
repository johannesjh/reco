define(['../lib/knockout'], function (ko) {
    function ConfigViewModel(mergeValues, historyValues, notificationValues, navigationValues, merge, history, notification, navigation, user, cssClass) {
        this.mergeValues = mergeValues;
        this.historyValues = historyValues;
        this.notificationValues = notificationValues;
        this.navigationValues = navigationValues;

        this.merge = ko.observable(merge);
        this.history = ko.observable(history);
        this.notification = ko.observable(notification);
        this.navigation = ko.observable(navigation);
        this.user = ko.observable(user);
        this.cssClass = ko.observable(cssClass);
        this.isConfigVisible = ko.observable(false);
    }

    ConfigViewModel.prototype.toggleShowConfig = function () {
        this.isConfigVisible(!this.isConfigVisible());
    };

    return ConfigViewModel;
});