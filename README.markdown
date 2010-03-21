# BindJS

A simple templating engine for node.js that smiles back.  It's influenced by mustache and the lift templating engine.

Currently works with Node v0.1.33

## Developed by
* Xavi Ramirez

## Goals
* Works on both the server and client side
* NO CODE IN TEMPLATES
* Simple markup
* Easy to debug
* Asynchronous
* Fast

## Examples
In the simplest case it looks likes mustache

####The mark up:
    <h1>Hello, {:user:}</h1>

####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { user: "Xavi" },
                function callback(data) { /* data === "<h1>Hello, Xavi</h1>" */ });

From there it differs a bit.  BindJS supports default values:
####The mark up:
    <h1>Hello, {:user -> Anonymous:}</h1>
####The Code:
    var bind = require("bind");
    
    bind.toFile("./file.html", {},
                function callback(data) { /* data === "<h1>Hello, Anonymous</h1>" */ });


### Bind Functions
####The mark up:
    <span>The time: {:time:}</span>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { time: function() { return new Date().toString(); } },
                function callback(data) { /* data === "<h1>Hello, Tue Feb 23 2010 21:59:24 GMT-0500 (EST)</h1>" */ });

The default value is past as the first parameter to the bound function.  Also note that `.toString` is called on the result.
####The mark up:
    <span>Two squared is {:square -> 2:}</span>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { square: function(val) { return val * val; } },
                function callback(data) { /* data === "<span>Two squared is 4</span>" */ });

### Bind Objects
####The mark up:
    <div>{:blog-entry ->
        <h2>[:blog-title:]</h2>
        <span>[:publish-date:]</span>
    :}
    </div>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", 
                { "blog-entry": { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" } },
                function callback(data) { 
                    /* data === "<div>
                                     <h2>The Sun Shines</h2>
                                     <span>Jan 1, 1984</span>
                                 </div>" */ 
                });

### Bind Arrays
####The mark up:
    <div>{:blog-entry ->
        <h2>[:blog-title:]</h2>
        <span>[:publish-date:]</span>
    :}
    </div>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", 
                { "blog-entry": [ { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" },
                                  { "blog-title": "The Moon Glows", "publish-date": "Jan 19, 1984" },
                                  { "blog-title": "Happy V-Day", "publish-date": "Feb 14, 1984" } ] },
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

### Embed files:
####The mark up:
    <div>{:file -> ./sales-report.txt:}</div>
####The code:
    var bind = require("bind");

    bind.toFile("./file.html", {}, 
                function callback(data) { /* data === <div>...file contents...</div> */ });

All paths are relative of the current working directory of the node process (aka `process.cwd()`) or the current path (aka `window.location`).

## Client side

To use bind on the client side, simply add the following `script` to your page:
    <script type="text/javascript" src="/lib/bind/bind.js"></script>

Once executed an object called `window.bind` is created.  This object contains all the functionality of bind on the server side.  The only difference is that on the client side, bind uses an `XHR` request to retrieve the contents of an embedded file instead of `require("fs").readFile`. Note that this functionality can be overwritten with `bind.setFileRetrieve`.

## The API

- __`bind.to(template, context, callback)`__: the `callback` is called with the results of binding the `template` and `context`.  See the above examples from more details.

- __`bind.toFile(path, context, callback)`__: the file content of `path` are loaded with the file retriever (see the `bind.setFileRetriever` for more details) and passed to `bind.to` as the `template`.

- __`bind.setFileRetriever(retrieve_fn)`__: the `retrieve_fn` function is responsible for providing content for `bind.toFile` as well as embedded files.  It should take a `path` and `callback` as parameters.  The `callback` should be executed once the `path` contents are ready. Here's a quick example:

    bind.setFileRetriever(function(path, callback) { // Look in DOM before making XHR request
        var elem = document.getElementById(path);
        if(elem) { callback(elem.innerHTML); }
        else { this.default(path, callback); } // Calls default file retrieve
    });

By default bind retrieves files with `require("fs").readFile` on the server side and with an `XHR` request on the client side.  Paths are assumed to be relative to the current working directory of the node process (aka `process.cwd()`) or the current path (aka `window.location`).

## Escaped characters

To escape {:, :}, [:, and :], add a \ in the middle.

Escaped delimiters: {\:, :\\}, [\:, and :\\]

## License
This project is released under [The MIT License](http://www.opensource.org/licenses/mit-license.php).