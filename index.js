(function(bind, undefined) {
    var toString = Object.prototype.toString;
    
    var nextTick = (function() {
        if(typeof process !== "undefined") {
            return function(fn) { process.nextTick(fn); };
        } else {
            return function(fn) { setTimeout(fn, 0); }
        }
    })();
    
    var log = (function() {
        if(typeof console !== "undefined") { return function(text) { console.log(text); }; }
        
        return function(text) { };
    })();
    
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
            var cache = {};
            
            function watchCache(path) {
                if(path in cache) { return; }
                
                cache[path] = null;
                fs.watchFile(path, function() { cache[path] = null; });
            }
            
            return function serverFile(path, callback) {
                if(cache[path]) { return callback(cache[path]); }
                
                fs.readFile(path, function(err, data) {
                    if(err) { throw err; }
                    
                    watchCache(path);
                    cache[path] = data;
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
                  .replace(/\/\\:/g, "\\:").replace(/:\/\\/g, ":\\")
                  .replace(/\(\^\\:/g, "(^:").replace(/:\\\^\)/g, ":^)");
    }
    
    function levelUp(val) { 
        return val.replace(/\[:/g, "(:").replace(/:]/g, ":)")
                  .replace(/\{:/g, "[:").replace(/:}/g, ":]")
                  .replace(/\|:/g, "{:").replace(/:\|/g, ":}")
                  .replace(/\/:/g, "|:").replace(/:\//g, ":|");
    }
    
    function binder(tag, context, predefines, callback) {
        if(context == undefined) { callback(""); return; }
        
        var split = tag.match(/\(:\s*(.+?)\s*~\s*([\s\S]+?)\s*:\)/) || [];
        var key = split[1] || tag.match(/\(:\s*(.+?)\s*:\)/)[1];
        var defVal = split[2] || "";
        var val = context[key];
        
        if(val === null) { callback(""); return; }
        
        if(val == undefined) { val = predefines[key]; }
        if(anchors.isAnchor(key)) { anchors.append(key, defVal); callback(""); return; }
        if(/(.+?)\[(.+?)\]/.test(key)) { // is Transform
            var match = /(.+?)\[(.+?)\]/.exec(key);
            val = transforms[match[1]](match[2]);
        }
        
        if(toString.call(val) === "[object Number]") { callback(val.toString()); return; }
        
        if(toString.call(val) === "[object String]") { bind.to(val, context, callback); return; }
        
        if(toString.call(val) === "[object Function]") {
            val(function(data, newContext, noBind) {
                if(noBind) { callback(data.toString()); }
                else { bind.to(data.toString(), newContext || context, callback); }
            }, defVal, context);
            return;
        }
        
        defVal = levelUp(defVal);
        if(val == undefined) { bind.to(defVal, {}, callback); return; }
        
        if(toString.call(val) === "[object Boolean]") {
            if(val) { bind.to(defVal, context, callback); } else { callback(""); }
            return;
        }
        
        if(toString.call(val) !== "[object Array]") { bind.to(defVal, val, callback); return; } // isObject
        
        var bindArray = new Array(val.length);
        var fireCallback = (function() {
            var count = val.length;
            
            return function() { if(count-- === 0) { callback(bindArray.join("")); } };
        })();
        for(var i = 0; i < val.length; i++) {
            bind.to(defVal, val[i], (function(i) { 
                return function(data) { bindArray[i] = data; fireCallback(); };
            })(i));
        }
        fireCallback();
    }
    
    var snips = (function() {
        var map = {};
        
        var nextId = (function(id) {
            return function nextId() { return "$?:" + (id++)  + ":?$"; };
        })(0);
        
        function create() {
            var id = nextId();
            return { id: id, callback: function(data) { map[id] = data; } };
        }
        
        function add(data) { 
            var id = nextId();
            map[id] = data;
            return id;
        }
        
        function restore(txt) {
            return txt.toString().replace(/\$\?:\d+?:\?\$/g, function(id) {
                var rtn = map[id];
                
                if(rtn === undefined) { return id; }
                
                delete map[id];
                return restore(rtn); 
            });
        }
        
        return { create: create, add: add, restore: restore };
    })();
    
    var anchors = (function() {
        var anchors = {};
        
        function isAnchor(id) {
            return toString.call(id) === "[object String]" && /#:.+?:#/.test(id);
        }
        
        function append(id, data) {
            anchors[id] = (anchors[id] || "") + data;
        }
        
        function restore(txt) {
            return txt.toString().replace(/#:.+?:#/g, function(id) {
                var rtn = anchors[id] || "";
                delete anchors[id];
                return restore(rtn);
            });
        };
        
        return { restore: restore, append: append, isAnchor: isAnchor };
    })();
    
    var predefines = {
        "file": function file(callback, path, context) {
            retrieveFile(path, function(data) { callback(data, context); });
        },
        "file^": function unboundFile(callback, path, context) {
            retrieveFile(path, function(data) { callback(data, context, true); });
        }
    };
    predefines["file-unescape"] = predefines["file^"];
    
    var transforms = {
        "if": function(key) {
            return function(callback, defVal, context) {
                bind.to(
                    levelUp(defVal), {
                        "then": function(callback, defVal) {
                            if(!context[key]) { callback(""); }
                            else { callback(levelUp(defVal), context[key]); }
                        },
                        "else": function(callback, defVal) {
                            if(context[key]) { callback(""); }
                            else { callback(levelUp(defVal), context[key]); }
                        }
                    }, callback
                );
            };
        }
    };
    
    function toFile(path, context, callback) {
        retrieveFile(path, function(data) { bind.to(data, context, callback); });
    }
    
    function to(template, context, callback) {
        template = template.toString(); // This makes bind-js compatibile with node.js buffers
        
        function fireCallback() {
            if(tagCount > 0) { return; }
            
            callback(unescape(snips.restore(anchors.restore(tmp))));
        }
        
        // Removed and store escaped blocks
        var tmp = template.replace(/\(\^:([\s\S]+?):\^\)/g, function(_, match) { return snips.add(match); });
        
        var tagCount = 0;    
        tmp = tmp.replace(/\(:[\s\S]+?:\)/g, function(tag) {
            var snip = snips.create()
            
            tagCount += 1;
            
            nextTick(function() {
                binder(tag, context, predefines, function(data) {
                    snip.callback(data);
                    tagCount -= 1; fireCallback();
                });
            });
            
            return snip.id;
        });
        fireCallback(); // Handle the case where no tags or files are found in the template
    }
    
    bind.setFileRetriever = function(retriever) {
        retrieveFile = function() { return retriever.apply({ "default": defaultRetrieveFile }, arguments); }; 
    };



    var push = Array.prototype.push;
    function Iterator(text) {
        var pos = 0, length = text.length;

        this.peek = function(num) {
            num = num || 0;
            if(pos + num >= length) { return null; }

            return text.charAt(pos + num);
        };
        this.next = function(inc) {
            inc = inc || 1;

            if(pos >= length) { return null; }

            return text.charAt((pos += inc) - inc);
        };
        this.pos = function() {
            return pos;
        };
    }

    var rWhitespace = /\s/;
    function isWhitespace(chr) {
        return rWhitespace.test(chr);
    }
    function consumeWhitespace(iter) {
        var start = iter.pos();

        while(isWhitespace(iter.peek())) { iter.next(); }

        return { type: "whitespace", start: start, end: iter.pos() };
    }

    function startsBinding(iter) {
        var char1 = iter.peek(0), char2 = iter.peek(1);

        return char2 === ":" && "({[".indexOf(char1) > -1;
    }

    function endsBinding(iter) {
        var char1 = iter.peek(0), char2 = iter.peek(1);

        return char1 === ":" && "]})".indexOf(char2) > -1;
    }

    function consumeStart(iter) {
        var range = { type: "start-binding", start: iter.pos(), delimiter: iter.peek() };

        iter.next(2);
        range.end = iter.pos();

        return range;
    }

    function consumeEnd(iter) {
        var range = { type: "end-binding", start: iter.pos(), delimiter: iter.peek(1) };

        iter.next(2);
        range.end = iter.pos();

        return range;
    }

    function isNamePatternSeparator(iter) {
        return iter.peek() === "=" && iter.peek(1) === ">";
    }

    function consumeNamePatternSeparator(iter) {
        var range = { type: "name-pattern-separator", start: iter.pos(), delimiter: iter.peek(1) };

        iter.next(2);
        range.end = iter.pos();

        return range;
    }

    function consumePattern(iter) {

    }

    function consumeBindingHead(iter) {
        var ranges = [];

        if(isWhitespace(iter.peek())) { ranges.push(consumeWhitespace(iter)); }

        var range = { type: "head-binding", start: iter.pos(), children: [] };

        range.children.push(consumeWhitespace(iter));
        range.children.push(consumePatternName(iter));
        range.children.push(consumeWhitespace(iter));
        range.children.push(consumeNamePatternSeparator(iter));
        range.children.push(consumeWhitespace(iter));
        range.children.push(consumePattern(iter));
        range.children.push(consumeWhitespace(iter));

        range.end = iter.pos();

        ranges.push(range);

        return ranges;
    }

    function isHeadBodySeparator(iter) {
        return iter.peek() === "~";
    }

    function consumeHeadBodySeparator(iter) {
        var range = { type: "head-body-separator", start: iter.pos() };

        while(isHeadBodySeparator(iter)) { iter.next(); }

        range.end = iter.pos();

        return [ range ];
    }

    function consumeText(iter) {
        var start = iter.pos(), end;

        while(!startsBinding(iter) && !endsBinding(iter) && iter.peek() !== null) { iter.next(); }

        return { type: "text", start: start, end: iter.pos() };
    }

    var matchDelimiters = { "(": ")", "{": "}", "[": "]" };
    function parseToRanges(str) {
        var iter = new Iterator(str);
        var ranges = [], stack = [];

        while(iter.peek() !== null) {
            if(startsBinding(iter)) {
                var range = consumeStart(iter);
                stack.push(range.delimiter);
                ranges.push(range);

                push.apply(ranges, consumeBindingHead(iter));
                push.apply(ranges, consumeHeadBodySeparator(iter));
            } else if(endsBinding(iter)) {
                var range = consumeEnd(iter);
                ranges.push(range);

                var expectedDelimiter = matchDelimiters[stack.pop()];
                if(expectedDelimiter !== range.delimiter) { throw "fuck didn't work."; }
            } else {
                ranges.push(consumeText(iter));
            }
        }

        if(stack.length !== 0) { console.error("whaa none empty stack: " + stack); }

        return ranges;
    }

    function to2(template, context, callback) {
        return parseToRanges(template)
    }









    bind.toFile = toFile;
    bind.to = to;
    bind.predefines = predefines;
    bind.to2 = to2;
}) (typeof exports === "object" ? exports : (window.bind = {}));