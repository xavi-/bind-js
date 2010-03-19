## BindJS

A simple templating engine for node js.  Its influences are mustache and the lift templating engine.

Currently works with Node v0.1.30

### Developed by
* Xavi Ramirez

### Goals
* Works on both Server and Client side
* Simple markup
* NO CODE IN TEMPLATES
* Data driven
* Easy to debug
* Runs Fast

### Examples
In the simplest case it looks likes mustache

The mark up:
    <h1>Hello, {:user:}</h1>

The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { user: "Xavi" },
                function callback(data) { /* data === "<h1>Hello, Xavi</h1>" */ });

From there it differs a bit.  BindJS supports default values:

The mark up:
    <h1>Hello, {:user:Anonymous:}</h1>

The Code:
    var bind = require("bind");
    
    bind.toFile("./file.html", {},
                function callback(data) { /* data === "<h1>Hello, Anonymous</h1>" */ });


#### Bind Functions

The mark up:
    <span>The time: {:time:}</span>

The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { time: function() { return new Date().toString(); } },
                function callback(data) { /* data === "<h1>Hello, Tue Feb 23 2010 21:59:24 GMT-0500 (EST)</h1>" */ });

#### Bind Objects
    
The mark up:
    <div>{:blog-entry:
        <h2>[:blog-title:]</h2>
        <span>[:publish-date:]</span>
    :}
    </div>
 
The Code:
    var bind = require("bind");

    bind.toFile("./file.html", 
                { "blog-entry": { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" } },
                function callback(data) { 
                    /* data === "<div>
                                     <h2>The Sun Shines</h2>
                                     <span>Jan 1, 1984</span>
                                 </div>" */ 
                });

#### Bind Arrays

The mark up:
    <div>{:blog-entry:
        <h2>[:blog-title:]</h2>
        <span>[:publish-date:]</span>
    :}
    </div>

The Code:
    var bind = require("bind");

    bind.toFile("./file.html", 
                { "blog-entry": [ { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" },
                                  { "blog-title": "The Moon Glows", "publish-date": "Jan 19, 1984" },
                                  { "blog-title": "Happy V-Day", "publish-date": "Feb 14, 1984" } ]},
                function callback(data) { 
                    /* data ===  "<div>
                                        <h2>The Sun Shines</h2>
                                        <span>Jan 1, 1984</span>
                                        <h2>The Moon Glows</h2>
                                        <span>Jan 19, 1984</span>
                                        <h2>Happy V-Day</h2>
                                        <span>Feb 14, 1984</span>
                                    </div>" */ 
                });

#### Embed files:

The mark up:
    <div>{:file: sales-report.txt:}</div>
    
The code:
    var bind = require("bind");

    bind.toFile("./file.html", {}, function callback(data) { /* data === <div>...file contents...</div> */ });
    
### Escape characters

To escape {:, :}, [:, and :], add a \ in the middle.

Escaped delimiters: {\:, :\}, [\:, and :\]

### License
This project is released under [The MIT License](http://www.opensource.org/licenses/mit-license.php).