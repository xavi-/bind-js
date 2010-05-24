var sys = require('sys');
var http = require('http');
var repl = require("repl");
var url = require("url");
var fs = require("fs");
var bind = require("../"); // Bind library
   
http.createServer(function (req, res) {
    if(url.parse(req.url).pathname === "/bind.js") {
        fs.readFile("../index.js", function(err, data) {
            if(err) { throw err; };
            
            res.writeHeader(200, { "Conent-Length": data.length,
                                   "Content-Type": "application/x-javascript" });
            res.end(data, "utf8");
        });
        
        return;
    }
    var a = new Array(7);
    for(var i = 0; i < 3; i++) { a[i] = {}; }
    a[3] = { name: "hello" };
    
    bind.toFile("./test.html",
                { "no-default-worked?": "yes it worked", 
                  "function-worked?":  function(def) { return "it worked: " + def; },
                  "number-worked?": 1,
                  "boolean-worked?": true,
                  "square": function(val) { return val * val; },
                  "zero-val": 0,
                  "page-info": { date: function() { return (new Date()).toString(); },
                                 "my-name": "Xavi Ramirez",
                                 "page-number": 4 },
                  "blog-entry": [ { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" },
                                  { "blog-title": "The Moon Glows", "publish-date": "Jan 19, 1984" },
                                  { "blog-title": "Happy V-Day", "publish-date": "Feb 14, 1984" } ],
                  "list": a,
                  "month-name": "March",
                  "weeks": [ { "week-name": "week one",
                               "days": [ { "day": "Monday",
                                           "date": "15th",
                                           "events": { "event-name": "Pre Booze", 
                                                       "guest-list": [ { "name": "Larry" }, 
                                                                       { "name": "Carl" } ] } },
                                         { "day": "Wednesday",
                                           "date": "17th",
                                           "events": { "event-name": "St. Patrick's",
                                                       "guest-list": [ { "name": "The Irish" }, 
                                                                       { "name": "Everyone Else" } ] } },
                                         { "day": "Friday",
                                           "date": "19th",
                                           "events": { "event-name": "Slam Dance",
                                                       "guest-list": [ { "name": "Julie" }, 
                                                                       { "name": "Jorge" } ] } } ] },
                             { "week-name": "week two",
                               "days": [ { "day": "Tuesday",
                                           "date": "23th",
                                           "events": { "event-name": "Rally Rock",
                                                       "guest-list": [ { "name": "Bobo" }, 
                                                                       { "name": "Lembley" } ] } },
                                         { "day": "Wednesday",
                                           "date": "24th",
                                           "events": { "event-name": "Willy Woo Wonderland",
                                                       "guest-list": [ { "name": "Alice" }, 
                                                                       { "name": "Eliza" } ] } } ] } ] },
                function(data) {
                    res.writeHeader(200, { "Content-Length": data.length,
                                           "Content-Type": "text/html" });
                    res.end(data, "utf8");
                });
}).listen(8000);
sys.puts('Server running at http://127.0.0.1:8000/');
//repl.start("server> ");

