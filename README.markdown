# BindJS

A simple templating engine for node.js that smiles back.  It's influenced by mustache and the lift templating engine.

Currently works with node.js v0.1.33

## Goals
* Works on both the server and client side
* NO CODE IN TEMPLATES
* Simple markup
* Easy to debug
* Asynchronous
* Fast
    
## The API

- __`bind.to(template, context, callback)`__: the `callback` is called with the results of binding the `template` and `context`.  See examples below from more details.

- __`bind.toFile(path, context, callback)`__: the file content of `path` are loaded with the file retriever (see the `bind.setFileRetriever` for more details) and passed to `bind.to` as the `template`.

- __`bind.setFileRetriever(retrieve_fn)`__: the `retrieve_fn` function is responsible for providing content for `bind.toFile` as well as embedded files.  It should take a `path` and `callback` as parameters.  The `callback` should be executed once the `path` contents are ready. Here's a quick example:

        bind.setFileRetriever(function(path, callback) { // Look in DOM before making XHR request
            var elem = document.getElementById(path);
            if(elem) { callback(elem.innerHTML); }
            else { this.default(path, callback); } // Calls default file retrieve
        });
By default bind retrieves files with `require("fs").readFile` on the server side and with an `XHR` request on the client side.  Paths are assumed to be relative to the current working directory of the node process (aka `process.cwd()`) or the current path (aka `window.location`).

## Client side

To use bind on the client side, simply add the following `script` to your page:
    <script type="text/javascript" src="/lib/bind/bind.js"></script>

Once executed an object called `window.bind` is created.  This object contains all the functionality of bind on the server side.  The only difference is that on the client side, bind uses an `XHR` request to retrieve the contents of an embedded file instead of `require("fs").readFile`. Note that this functionality can be overwritten with `bind.setFileRetrieve`.

## Examples
In the simplest case it looks likes mustache

####The Markup:
    <h1>Hello, (:user:)</h1>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { user: "Xavi" },
                function callback(data) { /* data === "<h1>Hello, Xavi</h1>" */ });

From there bind differs a bit.  For example, default values are supported:
####The Markup:
    <h1>Hello, (:user -> Anonymous:)</h1>
####The Code:
    var bind = require("bind");
    
    bind.toFile("./file.html", {},
                function callback(data) { /* data === "<h1>Hello, Anonymous</h1>" */ });


### Bind Functions
One of bind's core goals is to eliminate all conditional logic from templates.  To remain expressive bind supports binding to functions.

####The Markup:
    <span>The time: (:time:)</span>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { time: function() { return new Date().toString(); } },
                function callback(data) { /* data === "<h1>Hello, Tue Feb 23 2010 21:59:24 GMT-0500 (EST)</h1>" */ });

####The Markup:
    <span>Two squared is (:square -> 2:)</span>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { square: function(val) { return val * val; } },
                function callback(data) { /* data === "<span>Two squared is 4</span>" */ });

Note that the default value is passed as the first parameter to the bound function and that `.toString` is called on the result.

### Bind Objects
####The Markup:
    <div>(:blog-entry ->
        <h2>[:blog-title:]</h2>
        <span>[:publish-date:]</span>:)
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
####The Markup:
    <div>(:blog-entry ->
        <h2>[:blog-title:]</h2>
        <span>[:publish-date:]</span>:)
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
####The Markup:
    <div>(:file -> ./sales-report.txt:)</div>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", {}, 
                function callback(data) { /* data === <div>...file contents...</div> */ });

All paths are relative of the current working directory of the node process (aka `process.cwd()`) or the current path (aka `window.location`).

### Deeply Nested Templates
####The Markup:
    <table>
        <tr><th colspan=2>(:month-name:)</th></tr>
        (: weeks ->
        <tr>
            <th>[:week-name:]</th>
            [: days ->
            <td> 
                <span class="day">{:day:}</span> - <span class="date">{:date:}</span>
                <ol>{: events ->
                    <li class="<:event-type:>">
                        <h3><:event-name:></h3>
                        <h4>The Guests:</h4>
                        <ul>
                            <:guest-list -> <li>-:name:-</li>:>
                        </ul>
                    </li>:}
                </ol>
            </td>:]
        </tr>:)
    </table>
####The Code:
    var bind = require("bind");

    var ctx = { "month-name": "March",
                "weeks": [ { "week-name": "week one",
                             "days": [ { "day": "Monday",
                                         "date": "15th",
                                         "events": [ { "event-name": "Pre Booze", 
                                                       "guest-list": [ { "name": "Larry" }, 
                                                                       { "name": "Carl" } ] } ] },
                                       { "day": "Wednesday",
                                         "date": "17th",
                                         "events": [ { "event-name": "St. Patrick's",
                                                       "guest-list": [ { "name": "The Irish" }, 
                                                                       { "name": "Everyone Else" } ] } ] },
                                       { "day": "Friday",
                                         "date": "19th",
                                         "events": [ { "event-name": "Slam Dance",
                                                       "guest-list": [ { "name": "Julie" }, 
                                                                       { "name": "Jorge" } ] } ] } ] },
                           { "week-name": "week two",
                             "days": [ { "day": "Tuesday",
                                         "date": "23th",
                                         "events": [ { "event-name": "Rally Rock",
                                                       "guest-list": [ { "name": "Bobo" }, 
                                                                       { "name": "Lembley" } ] } ] },
                                       { "day": "Wednesday",
                                         "date": "24th",
                                         "events": [ { "event-name": "Willy Woo Wonderland",
                                                       "guest-list": [ { "name": "Alice" }, 
                                                                       { "name": "Eliza" } ] } ] } ] } ] };
    
    bind.toFile("./file.html", ctx, function callback(data) {
        /* data === "<table>
                        <tr><th colspan=2>March</th></tr>
                        <tr>
                            <th>week one</th>
                            <td> 
                                <span class="day">Monday</span> - <span class="date">15th</span>

                                <ol><li class="">
                                        <h3>Pre Booze</h3>
                                        <h4>The Guests:</h4>
                                        <ul>
                                            <li>Larry</li><li>Carl</li>
                                        </ul>
                                    </li>

                                </ol>
                            </td><td> 
                                <span class="day">Wednesday</span> - <span class="date">17th</span>
                                <ol><li class="">
                                        <h3>St. Patrick's</h3>
                                        <h4>The Guests:</h4>

                                        <ul>
                                            <li>The Irish</li><li>Everyone Else</li>
                                        </ul>
                                    </li>
                                </ol>
                            </td><td> 
                                <span class="day">Friday</span> - <span class="date">19th</span>

                                <ol><li class="">
                                        <h3>Slam Dance</h3>
                                        <h4>The Guests:</h4>
                                        <ul>
                                            <li>Julie</li><li>Jorge</li>
                                        </ul>
                                    </li>

                                </ol>
                            </td>
                        </tr><tr>
                            <th>week two</th>
                            <td> 
                                <span class="day">Tuesday</span> - <span class="date">23th</span>
                                <ol><li class="">

                                        <h3>Rally Rock</h3>
                                        <h4>The Guests:</h4>
                                        <ul>
                                            <li>Bobo</li><li>Lembley</li>
                                        </ul>
                                    </li>
                                </ol>

                            </td><td> 
                                <span class="day">Wednesday</span> - <span class="date">24th</span>
                                <ol><li class="">
                                        <h3>Willy Woo Wonderland</h3>
                                        <h4>The Guests:</h4>
                                        <ul>

                                            <li>Alice</li><li>Eliza</li>
                                        </ul>
                                    </li>
                                </ol>
                            </td>
                        </tr>
                    </table>" */
    });
    
## Escaped characters

The following character combinations must be escaped to appear correctly in a bound template:

* original: `(: [: (: <: -:  :- :> :) :] :)`
* escaped: `(\: [\: {\: <\: -\:  :\- :\> :\} :\] :\)`

## Developed by
* Xavi Ramirez

## License
This project is released under [The MIT License](http://www.opensource.org/licenses/mit-license.php).