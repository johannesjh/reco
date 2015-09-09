define(function () {
    function Connector() {
        this.socket = {};
    }

    Connector.prototype.connect = function (url) {
        this.socket = io.connect(url);
    };

    Connector.prototype.send = function (data) {
        this.socket.emit('update', data);
    };

    Connector.prototype.lock = function (data) {
        this.socket.emit('lock', data);
    };

    Connector.prototype.unlock = function (data) {
        this.socket.emit('unlock', data);
    };

    Connector.prototype.scroll = function (data) {
        this.socket.emit('scroll', data);
    };

    return Connector;
});