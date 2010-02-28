(function(bind, undefined) {
    var evt = require("events");
    var fs = require("fs");
    var sys = require("sys");
    var toString = Object.prototype.toString;
    
    function cleanUp(val) { 
        return val.replace(/\[\{/g, "{{").replace(/}]/g, "}}");
    }
    
    function binder(tag, context) {
        var split = tag.match(/\s*(.+?)\s*:\s*([\s\S]+)\s*/) || [];
        var key = split[1] || tag, defVal = split[2] || "";
        var val = context[key];
        sys.puts("key: " + key + "; val: " + val + "; defVal: " + defVal);
        if(val == undefined) { return defVal; }
        
        if(toString.call(val) === "[object String]") { return val; }
        
        if(toString.call(val) === "[object Function]") { return val(defVal); }
        
        if(toString.call(val) === "[object Number]") { return val.toString(); }
        
        if(toString.call(val) === "[object Boolean]") { return val.toString(); }
        
        defVal = cleanUp(defVal);
        if(!val.length) { return bind.to(defVal, val); }
        
        return Array.prototype.map.call(val, function(context) { return bind.to(defVal, context); }).join("");
    }
    
    bind.toFile = function toFile(file, context, callback) {
        fs.readFile(file, function(err, data) {
            if(err) { throw err; }
            
            callback(bind.to(data, context));
        });
    };
    
    bind.to = function to(string, context) {
        return string.replace(/{{([\s\S]+?)}}/g, function(_, tag) { return binder(tag, context); });
    };
}) (exports);