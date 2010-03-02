(function(bind, undefined) {
    var toString = Object.prototype.toString;
    
    var retrieveFile = (function() {
        if(typeof window !== "undefined") { // on client side
            return (function() {
                function xhr() { 
                    return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest(); 
                }
                
                return function clientFile(name, callback) {
                    var client = xhr();
                    client.open("GET", name);
                    client.onreadystatechange = function() {
                        if(client.readyState !== 4) { return; }
                        
                        callback(client.responseText);
                    };
                    client.send();
                };
            })();
        }
        
        return (function() { // on server side
            var fs = require("fs");
            return function serverFile(name, callback) {
                fs.readFile(name, function(err, data) {
                    if(err) { throw err; }
                    
                    callback(data); 
                });
            };
        })();
    })();
    
    function cleanUp(val) { 
        return val.replace(/\[\{/g, "{{").replace(/}]/g, "}}");
    }
    
    function binder(tag, context, predefines, callback) {
        var split = tag.match(/{{\s*(.+?)\s*:\s*([\s\S]+)\s*}}/) || [];
        var key = split[1] || tag.match(/{{\s*(.+?)\s*}}/)[1], defVal = split[2] || "";
        var val = context[key] || predefines[key];
        
        if(val == undefined) { callback(defVal); return; }
        
        if(toString.call(val) === "[object String]") { callback(val); return; }
        
        if(toString.call(val) === "[object Function]") { callback(val(defVal, context).toString()); return; }
        
        if(toString.call(val) === "[object Number]") { callback(val.toString()); return; }
        
        if(toString.call(val) === "[object Boolean]") { callback(val.toString()); return; }
        
        defVal = cleanUp(defVal);
        if(!val.length) { bind.to(defVal, val, callback); return; }
        
        var bindArray = new Array(val.length);
        var fireCallback = (function() {
            var count = val.length;
            
            return function() { if(--count === 0) { callback(bindArray.join("")); } };
        })();
        Array.prototype.forEach.call(val, function(context, idx) {
            bind.to(defVal, context, function(data) { bindArray[idx] = data; fireCallback(); });
        });
        fireCallback();
    }
    
    function toFile(name, context, callback) {
        retrieveFile(name, function(data) { bind.to(data, context, callback); });
    };
    
    function to(string, context, callback) {
        var fileCount = 0;
        
        function file(name, context) {
            var placeHolder = "[[file:" + name + "]]";
            
            fileCount += 1;
            
            retrieveFile(name, function(data) {
                bind.to(data, context, function(data) {
                    tmp = tmp.replace(placeHolder, data); 
                    fileCount -= 1; fireCallback(); 
                });
            });
                        
            return placeHolder;
        }
        
        function fireCallback() {
            if(fileCount > 0) { return; }
            
            if(tagCount > 0) { return; }
            
            callback(tmp);
        }
        
        var predefines = { file: file };
        var tmp = string;
        
        var matches = string.match(/{{[\s\S]+?}}/g);
        if(!matches || matches.length === 0) { fireCallback(); return; }
        
        var tagCount = matches.length;
        matches.forEach(function(tag) {            
            binder(tag, context, predefines, function(data) {
                tmp = tmp.replace(tag, data);
                tagCount -= 1; fireCallback();
            }); 
        });
    };
    
    bind.toFile = toFile;
    bind.to = to;
}) (typeof exports === "object" ? exports : (window.bind = {}));