(function(bind, undefined) {
    var toString = Object.prototype.toString;
    
    var retrieveFile, defaultRetrieveFile;
    retrieveFile = defaultRetrieveFile = (function() {
        if(typeof window !== "undefined") { // on client side
            return (function() {
                function xhr() { 
                    return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest(); 
                }
                
                return function clientFile(path, callback) {
                    var client = xhr();
                    client.open("GET", path);
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
            return function serverFile(path, callback) {
                fs.readFile(path, function(err, data) {
                    if(err) { throw err; }
                    
                    callback(data); 
                });
            };
        })();
    })();
    
    function unescape(val) {
        return val.replace(/\(\\:/g, "(:").replace(/:\\\)/g, ":)")
                  .replace(/\[\\:/g, "[:").replace(/:\\]/g, ":]")
                  .replace(/\{\\:/g, "{:").replace(/:\\}/g, ":}")
                  .replace(/\|\\:/g, "|:").replace(/:\\\|/g, ":|")
                  .replace(/\\\\:/g, "\\:").replace(/:\\\\/g, ":\\")
                  .replace(/\(\^\\:/g, "(^:").replace(/:\\\^\)/g, ":^)");
    }
    
    function cleanUp(val) { 
        return val.replace(/\[:/g, "(:").replace(/:]/g, ":)")
                  .replace(/\{:/g, "[:").replace(/:}/g, ":]")
                  .replace(/\|:/g, "{:").replace(/:\|/g, ":}")
                  .replace(/\\:/g, "|:").replace(/:\\/g, ":|");
    }
    
    function binder(tag, context, predefines, callback) {
        var split = tag.match(/\(:\s*(.+?)\s*~\s*([\s\S]+)\s*:\)/) || [];
        var key = split[1] || tag.match(/\(:\s*(.+?)\s*:\)/)[1], defVal = split[2] || "";
        var val = context[key] || predefines[key];
        
        if(val == undefined) { callback(defVal); return; }
        
        if(toString.call(val) === "[object String]") { callback(val); return; }
        
        if(toString.call(val) === "[object Function]") { callback(val(defVal, context).toString()); return; }
        
        if(toString.call(val) === "[object Number]") { callback(val.toString()); return; }
        
        if(toString.call(val) === "[object Boolean]") { callback(val.toString()); return; }
        
        defVal = cleanUp(defVal); 
        if(toString.call(val) !== "[object Array]") { bind.to(defVal, val, callback); return; } // isObject
        
        var bindArray = new Array(val.length);
        var fireCallback = (function() {
            var count = val.length;
            
            return function() { if(--count === 0) { callback(bindArray.join("")); } };
        })();
        val.forEach(function(context, idx) {
            bind.to(defVal, context, function(data) { bindArray[idx] = data; fireCallback(); });
        });
        fireCallback();
    }
    
    function toFile(path, context, callback) {
        retrieveFile(path, function(data) { bind.to(data, context, callback); });
    };
    
    var safeText = (function() {
        var safe = {}, nextId = 0;
        
        function save(text) {
            return text.replace(/\(\^:([\s\S]+?):\^\)/g, function(_, match) { 
                var id = "(^:" + (nextId++) + ":^)";
                safe[id] = match;
                return id;
            });
        }
        
        function restore(txt) {
            return txt.replace(/\(\^:\d+?:\^\)/g, function(id) { var rtn = safe[id]; delete safe[id]; return rtn; });
        }
        
        return { save: save, restore: restore, safe: safe };
    })();
    
    function to(template, context, callback) {
        var fileCount = 0;
        
        function file(path, context) {
            var placeHolder = "(^:file:" + path + ":^)";
            
            fileCount += 1;
            
            bind.toFile(path, context, function(data) {
                tmp = tmp.replace(placeHolder, data);
                fileCount -= 1; fireCallback();
            });
            
            return placeHolder;
        }
        
        function unboundFile(path, context) {
            var placeHolder = "(^:" + ((Math.random() * 50) >> 0) + ":^)";
            
            fileCount += 1;
            
            retrieveFile(path, function(data) {
                safeText.safe[placeHolder] = data;
                fileCount -= 1; fireCallback();
            });
            
            return placeHolder;
        }
        
        function fireCallback() {
            if(fileCount > 0) { return; }
            
            if(tagCount > 0) { return; }
            
            callback(safeText.restore(unescape(tmp)));
        }
        
        var predefines = { "file": file, "file^": unboundFile };
        var tmp = safeText.save(template);
        
        var matches = template.match(/\(:[\s\S]+?:\)/g);
        if(!matches || matches.length === 0) { fireCallback(); return; }
        
        var tagCount = matches.length;
        matches.forEach(function(tag) {            
            binder(tag, context, predefines, function(data) {
                tmp = tmp.replace(tag, data);
                tagCount -= 1; fireCallback();
            }); 
        });
    };
    
    bind.setFileRetriever = function(retriever) {
        retrieveFile = function() { return retriever.apply({ "default": defaultRetrieveFile }, arguments); }; 
    };
    bind.toFile = toFile;
    bind.to = to;
}) (typeof exports === "object" ? exports : (window.bind = {}));