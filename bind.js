(function(context, undefined) {
    var evt = require("events");
    var fs = require("fs");
    
    var toString = Object.prototype.toString;
    
    function binder(binds, item) {
        var split = item.match(/\s*(.+?)\s*:(.+)/) || [];
        var key = split[1] || item, defVal = split[2] || "";
        var val = binds[key];
        sys.puts("key: " + key + "; val: " + val + "; defVal: " + defVal);
        if(val == undefined) { return defVal; }
        
        if(toString.call(val) === "[object String]") { return val; }
        
        if(toString.call(val) === "[object Function]") { return val(defVal); }
        
        if(toString.call(val) === "[object Number]") { return val.toString(); }
        
        if(toString.call(val) === "[object Boolean]") { return val.toString(); }
    }
    
    context.bind = function bind(file, binds) {
        var promise = new evt.Promise();
        
        fs.readFile(file).addCallback(function(data) {
            var bound = data.replace(/{{(.+?)}}/g, function(_, item) { return binder(binds, item); });
            promise.emitSuccess(bound);
        });
        
        return promise;
    };
}) (exports);