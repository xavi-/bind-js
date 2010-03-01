(function(bind, undefined) {
    var fs = require("fs");
    var sys = require("sys");
    var toString = Object.prototype.toString;
    
    function cleanUp(val) { 
        return val.replace(/\[\{/g, "{{").replace(/}]/g, "}}");
    }
    
    function binder(tag, context, predefines) {
        var split = tag.match(/\s*(.+?)\s*:\s*([\s\S]+)\s*/) || [];
        var key = split[1] || tag, defVal = split[2] || "";
        var val = context[key] || predefines[key];
        sys.puts("key: " + key + "; val: " + val + "; defVal: " + defVal);
        if(val == undefined) { return defVal; }
        
        if(toString.call(val) === "[object String]") { return val; }
        
        if(toString.call(val) === "[object Function]") { return val(defVal, context); }
        
        if(toString.call(val) === "[object Number]") { return val.toString(); }
        
        if(toString.call(val) === "[object Boolean]") { return val.toString(); }
        
        defVal = cleanUp(defVal);
        if(!val.length) { return bind.to(defVal, val); }
        
        return Array.prototype.map.call(val, function(context) { return bind.to(defVal, context); }).join("");
    }
    
    bind.toFile = function toFile(name, context, callback) {
        fs.readFile(name, function(err, data) {
            if(err) { throw err; }
            
            bind.to(data, context, callback);
        });
    };
    
    bind.to = function to(string, context, callback) {
        var fileCount = 0;
        
        function file(name, context) {
            var placeHolder = "[[file:" + name + "]]";
            
            fs.readFile(name, function(err, data) {
                if(err) { throw err; }
                
                bind.to(data, context, function(data) { tmp = tmp.replace(placeHolder, data); fireCallback(); });
            });
            
            fileCount += 1;
            
            return placeHolder;
        }
        
        function fireCallback() {
            if(fileCount-- > 0) { return; }
            
            callback(tmp);
        }
        
        var predefines = { file: file };
        var tmp = string.replace(/{{([\s\S]+?)}}/g, function(_, tag) { return binder(tag, context, predefines); });
        if(callback) { fireCallback(); }
        
        return tmp;
    };
}) (exports);