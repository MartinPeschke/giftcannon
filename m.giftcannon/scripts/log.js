(function() {
    var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
    window.JSLogger = (function() {
        JSLogger.prototype.url = false;
        JSLogger.prototype.proto = false;
        JSLogger.prototype.host = location.hostname;
        JSLogger.prototype.port = 80;
        JSLogger.prototype.portSSL = 443;
        JSLogger.prototype.track = true;
        JSLogger.prototype.logWindowErrors = true;
        function JSLogger(options) {
            if (options == null) options = {};
            this.windowErrorHandler = __bind(this.windowErrorHandler, this);
            this.setOptions(options);
            if (this.logWindowErrors) window.onerror = this.windowErrorHandler;
        }
        JSLogger.prototype.log = function(data) {
            if (this.track) return this.logDataByType("log", data);
        };
        JSLogger.prototype.setOptions = function(options) {
            this.url = options.url || this.url;
            this.proto = options.proto || this.getCurrentProtocol();
            this.host = options.host || this.host;
            this.portSSL = options.portSSL || this.portSSL;
            this.port = options.port || this.getPortByProtocol();
            this.track = typeof options.track !== "undefined" ? options.track : this.track;
            return this.logWindowErrors = typeof options.logWindowErrors !== "undefined" ? options.logWindowErrors : this.logWindowErrors;
        };

        JSLogger.prototype.getCurrentProtocol = function() {
            return window.location.protocol.replace(":", "");
        };

        JSLogger.prototype.getPortByProtocol = function() {
            if (this.proto === "https") {
                return this.portSSL;
            } else {
                return this.port;
            }
        };

        JSLogger.prototype.createCORSRequest = function(url) {
            var xhr;
            xhr = typeof XMLHttpRequest !== "undefined" ? new XMLHttpRequest() : null;
            if (this.proto !== "https" && xhr && "withCredentials" in xhr) {
                xhr.open("post", url, true);
            } else if (this.proto !== "https" && typeof XDomainRequest !== "undefined") {
                xhr = new XDomainRequest();
                xhr.open("post", url);
            } else {
                xhr = document.createElement("script");
                xhr.type = "text/javascript";
                xhr.src = url;
            }
            return xhr;
        };

        JSLogger.prototype.logDataByType = function(type, data) {
            var params, request, url;
            url = this.getUrl(type);
            request = this.createCORSRequest(url);
            if (request) {
                params = this.serialize(data, "dump");
                return this.sendData(request, params);
            }
        };

        JSLogger.prototype.sendData = function(request, params) {
            var body;
            if (typeof request.setRequestHeader === "function") {
                request.setRequestHeader("Content-type", "text/plain");
            }
            if (typeof request.send === "function" || typeof request.send === "object") {
                request.send(params);
            }
            if (request.type && request.type === "text/javascript") {
                request.src = "" + request.src + "?" + params;
                body = document.getElementsByTagName("body")[0];
                body.appendChild(request);
                return body.removeChild(request);
            }
        };

        JSLogger.prototype.serialize = function(obj, prefix) {
            return "msg="+obj.msg +"|url="+obj.url+"|line="+obj.line;
        };

        JSLogger.prototype.getUrl = function(action) {
            if (!this.url) {
                this.url = ":proto://:host::port".replace(/:proto/, this.proto).replace(/:host/, this.host).replace(/:port/, this.port);
            }
            return "" + this.url + "/" + action;
        };

        JSLogger.prototype.windowErrorHandler = function(msg, url, line) {
            return this.log({
                msg: msg,
                url: url,
                line: line
            });
        };

        return JSLogger;

    })();
    window.jslogger = new JSLogger();
}).call(this);