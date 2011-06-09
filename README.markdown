# BindJS

A simple templating engine for node.js that smiles back.  It's influenced by mustache and the [lift](http://liftweb.net/) [templating engine](http://www.assembla.com/wiki/show/liftweb/View_First).

Currently works with node.js v0.1.30 and above

## Goals
* Works on both the server and client side
* NO CODE IN TEMPLATES
* Simple markup
* Easy to debug
* Asynchronous
* Fast

## The API

- __`bind.to(template, context, callback)`__: the `callback` is called with the results of binding the `template` to the `context`.  See examples below from more details.

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
In the simplest case bind looks a lot like mustache

####The Markup:
    <h1>Hello, (:user:)</h1>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { user: "Xavi" },
                function callback(data) { /* data === "<h1>Hello, Xavi</h1>" */ });

From there bind differs a bit.  For example, default values are supported:
####The Markup:
    <h1>Hello, (:user ~ Anonymous:)</h1>
####The Code:
    var bind = require("bind");
    
    bind.toFile("./file.html", {},
                function callback(data) { /* data === "<h1>Hello, Anonymous</h1>" */ });

If the binding property (in this case `user`) is not found in the context object (the second parameter), then the default value is used.  Also noted that if `null` or `undefined` is passed in as the context, then an empty string is immediately returned.

### Bind Functions
One of bind's core goals is to eliminate all conditional logic from templates, but to remain expressive bind supports binding to functions.

####The Markup:
    <span>The time: (:time:)</span>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { time: function(callback) { callback(new Date()); } },
                function callback(data) { /* data === "<span>The time: Tue Feb 23 2010 21:59:24 GMT-0500 (EST)</span>" */ });

####The Markup:
    <span>Two squared is (:square ~ 2:)</span>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { square: function(callback, val) { callback(val * val); } },
                function callback(data) { /* data === "<span>Two squared is 4</span>" */ });

To parallel the asynchronous nature of node.js, bound functions _must_ use the `callback` parameter to return data.  Note that the default value is passed as the second parameter and that the bind context is passed in as the third parameter.  Also, keep in mind that `.toString` is invoked on the value passed to `callback`.


### Bind Booleans
####The Markup:
    (: signed-in? ~ Welcome back [: user-name :] :)
####The Code
    var bind = require("bind");

    bind.toFile("./file.html", { "signed-in?": false }, function callback(data) { /* data === "" */ });
    
    bind.toFile("./file.html", { "signed-in?": true, "user-name": "Lisa" },
                function callback(data) { /* data === "Welcome back Lisa" */ });

### Bind Objects
####The Markup:
    <div>(:blog-entry ~
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
    <div>(:blog-entry ~
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
    <div>(:file ~ ./sales-report.txt:)</div>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", {}, 
                function callback(data) { /* data === <div>...file contents...</div> */ });

All paths are relative of the current working directory of the node process (aka `process.cwd()`) or the current path (aka `window.location`).

By default the content of the embedded file is bound and escaped.  To simply embed the unescaped contents of a file, use `file^` instead.

####The Markup:
    <div>(:file ~ ./status-template.html:)</div>
    <script id="status-template">
        (:file^ ~ ./status-template.html:)
    </script>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { "user-img": "fred.jpg", status: "Rockin' hard..." }, 
                function callback(data) { /* data === <div>...unescaped file contents...</div> */ });

This is useful when you want to reuse a template on the client side and on the server while rendering the page.

### Deeply Nested Templates
####The Markup:
    <table>
        <tr><th colspan=2>(:month-name:)</th></tr>
        (: weeks ~
        <tr>
            <th>[:week-name:]</th>
            [: days ~
            <td> 
                <span class="day">{:day:}</span> - <span class="date">{:date:}</span>
                <ol>{: events ~
                    <li class="|:event-type:|">
                        <h3>|:event-name:|</h3>
                        <h4>The Guests:</h4>
                        <ul>
                            |:guest-list ~ <li>/:name:/</li>:|
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

### Making if/then/else statement
####The Markup:
    <div>(: if[signed-in] ~
        [: then ~ Welcome user :]
        [: else ~ Sign in here :]:)
    </div>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html",{ "signed-in": true },
                function callback(data) { /* data === "<div>Welcome user</div>" */ });

## Fine points

### `null` vs `undefined`

In order to allow for the fine control of mark up bind makes a distinction of `null` and `undefined`.  Matches against `null` result in an empty string, while a match against `undefined` outputs the default value.

####The Markup:
    <div>(:foo ~ bar:)</div>
    <div>(:wee ~ poo:)</div>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", { foo: null }, 
                function callback(data) { /* data === <div></div>
                                                      <div>poo</div> */ });

## Escaped characters

The following character combinations must be escaped to appear correctly in a bound template:

* original: `(^: (: [: {: |: /:  :/ :| :} :] :) :^)`
* escaped: `(^\: (\: [\: {\: |\: /\:  :\/ :\| :\} :\] :\) :\^)`

Any text between `(^:` and `:^)` will automatically be escaped as well.  These delimiters cannot be nested.

## Getting Bind

The easiest way to get bind is with [npm](http://npmjs.org/):

    npm install bind

Alternatively you can clone this git repository:

    git clone git://github.com/Xavi-/bind-js.git

## Developed by
* Xavi Ramirez

## License
This project is released under [The MIT License](http://www.opensource.org/licenses/mit-license.php).