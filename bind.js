(function(bind, undefined) {
    var evt = require("events");
    var fs = require("fs");
    var sys = require("sys");
    var toString = Object.prototype.toString;
    
    function cleanUp(val) { 
        return val.replace(/\[\{/g, "{{").replace(/}]/g, "}}");
    }
    
    function binder(binds, item) {
        var split = item.match(/\s*(.+?)\s*:\s*([\s\S]+)\s*/) || [];
        var key = split[1] || item, defVal = split[2] || "";
        var val = binds[key];
        sys.puts("key: " + key + "; val: " + val + "; defVal: " + defVal);
        if(val == undefined) { return defVal; }
        
        if(toString.call(val) === "[object String]") { return val; }
        
        if(toString.call(val) === "[object Function]") { return val(defVal); }
        
        if(toString.call(val) === "[object Number]") { return val.toString(); }
        
        if(toString.call(val) === "[object Boolean]") { return val.toString(); }
        
        defVal = cleanUp(defVal);
        if(!val.length) { return bind.to(defVal, val); }
        
        return Array.prototype.map.call(val, function(binds) { return bind.to(defVal, binds); }).join("");
    }
    
    bind.toFile = function toFile(file, binds) {
        var promise = new evt.Promise();
        
        fs.readFile(file).addCallback(function(data) {
            promise.emitSuccess(bind.to(data, binds));
        });
        
        return promise;
    };
    
    bind.to = function to(string, binds) {
        return string.replace(/{{([\s\S]+?)}}/g, function(_, item) { return binder(binds, item); });
    };
}) (exports);