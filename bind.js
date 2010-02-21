var evt = require("events");
var fs = require("fs");

(function(context) {
    context.bind = function bind(file, context) {
        var promise = new evt.Promise();
        
        fs.readFile(file, "utf8").addCallback(function(data) {
            var bound = data.replace(/{{(.+?)}}/, function(match, item) { return context[item]; });
            promise.emitSuccess(bound);
        });
        
        return promise;
    };
}) (exports);