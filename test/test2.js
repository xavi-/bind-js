var assert = require("assert");
var bind = require("../");

bind.to("<h1>Hello, (:user:)</h1>", { user: "Xavi" },
        function callback(data) {  assert.equal(data, "<h1>Hello, Xavi</h1>"); });

bind.to("<h1>Hello, (:user ~ Anonymous:)</h1>", {},
        function callback(data) { assert.equal(data, "<h1>Hello, Anonymous</h1>"); });

var curTime = new Date();
bind.to("<span>The time: (:time:)</span>", { time: function(callback) { callback(curTime); } },
         function callback(data) { assert.equal(data, "<span>The time: " + curTime + "</span>"); });

bind.to("<span>Two squared is (:square ~ 2:)</span>",
        { square: function(callback, val) { callback(val * val); } },
        function callback(data) { assert.equal(data, "<span>Two squared is 4</span>"); });

bind.to(
    "(: signed-in? ~ Welcome back [: user-name :] :)",
    { "signed-in?": false },
    function callback(data) { assert.equal(data, ""); }
);

bind.to(
    "(: signed-in? ~ Welcome back [: user-name :] :)",
    { "signed-in?": true, "user-name": "Lisa" },
    function callback(data) { assert.equal(data, "Welcome back Lisa"); }
);

bind.to(
    "<div>(:blog-entry ~ <h2>[:blog-title:]</h2><span>[:publish-date:]</span>:)</div>",
    { "blog-entry": { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" } },
    function callback(data) { assert.equal(data, "<div><h2>The Sun Shines</h2><span>Jan 1, 1984</span></div>"); }
);

bind.to(
    "<div>(:blog-entry ~ <h2>[:blog-title:]</h2><span>[:publish-date:]</span>:)</div>",
    { "blog-entry": [ { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" },
                      { "blog-title": "The Moon Glows", "publish-date": "Jan 19, 1984" },
                      { "blog-title": "Happy V-Day", "publish-date": "Feb 14, 1984" } ] },
    function callback(data) { 
        assert.equal(data, "<div><h2>The Sun Shines</h2><span>Jan 1, 1984</span><h2>The Moon Glows</h2><span>Jan 19, 1984</span><h2>Happy V-Day</h2><span>Feb 14, 1984</span></div>");
    }
);

var template =
'<table>\n\
    <tr><th colspan=2>(:month-name:)</th></tr>\n\
    (: weeks ~\n\
    <tr>\n\
        <th>[:week-name:]</th>\n\
        [: days ~\n\
        <td>\n\
            <span class="day">{:day:}</span> - <span class="date">{:date:}</span>\n\
            <ol>{: events ~\n\
                <li class="|:event-type:|">\n\
                    <h3>|:event-name:|</h3>\n\
                    <h4>The Guests:</h4>\n\
                    <ul>\n\
                        |:guest-list ~ <li>/:name:/</li>:|\n\
                    </ul>\n\
                </li>:}\n\
            </ol>\n\
        </td>:]\n\
    </tr>:)\n\
</table>';
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
var result =
'<table>\n\
    <tr><th colspan=2>March</th></tr>\n\
    <tr>\n\
        <th>week one</th>\n\
        <td>\n\
            <span class="day">Monday</span> - <span class="date">15th</span>\n\
            <ol><li class="">\n\
                    <h3>Pre Booze</h3>\n\
                    <h4>The Guests:</h4>\n\
                    <ul>\n\
                        <li>Larry</li><li>Carl</li>\n\
                    </ul>\n\
                </li>\n\
            </ol>\n\
        </td><td>\n\
            <span class="day">Wednesday</span> - <span class="date">17th</span>\n\
            <ol><li class="">\n\
                    <h3>St. Patrick\'s</h3>\n\
                    <h4>The Guests:</h4>\n\
                    <ul>\n\
                        <li>The Irish</li><li>Everyone Else</li>\n\
                    </ul>\n\
                </li>\n\
            </ol>\n\
        </td><td>\n\
            <span class="day">Friday</span> - <span class="date">19th</span>\n\
            <ol><li class="">\n\
                    <h3>Slam Dance</h3>\n\
                    <h4>The Guests:</h4>\n\
                    <ul>\n\
                        <li>Julie</li><li>Jorge</li>\n\
                    </ul>\n\
                </li>\n\
            </ol>\n\
        </td>\n\
    </tr><tr>\n\
        <th>week two</th>\n\
        <td>\n\
            <span class="day">Tuesday</span> - <span class="date">23th</span>\n\
            <ol><li class="">\n\
                    <h3>Rally Rock</h3>\n\
                    <h4>The Guests:</h4>\n\
                    <ul>\n\
                        <li>Bobo</li><li>Lembley</li>\n\
                    </ul>\n\
                </li>\n\
            </ol>\n\
        </td><td>\n\
            <span class="day">Wednesday</span> - <span class="date">24th</span>\n\
            <ol><li class="">\n\
                    <h3>Willy Woo Wonderland</h3>\n\
                    <h4>The Guests:</h4>\n\
                    <ul>\n\
                        <li>Alice</li><li>Eliza</li>\n\
                    </ul>\n\
                </li>\n\
            </ol>\n\
        </td>\n\
    </tr>\n\
</table>';
bind.to(template, ctx, function callback(data) { assert.equal(data, result); });

bind.to(
    "<div>(:foo ~ bar:)</div><div>(:wee ~ poo:)</div>",
    { foo: null },
    function callback(data) { assert.equal(data, "<div></div><div>poo</div>"); }
);


bind.to(
    "<div>(: if[signed-in] ~ [: then ~ Welcome user :][: else ~ sign in here :]:)</div>",
    { "signed-in": true },
    function callback(data) { assert.equal(data, "<div>Welcome user</div>"); }
);

bind.to(
    "<div>(: if[signed-in] ~ [: then ~ Welcome user :][: else ~ sign in here :]:)</div>",
    { "signed-in": false },
    function callback(data) { assert.equal(data, "<div>sign in here</div>"); }
);

bind.to (
    '(: all ~ [: if[error] ~ {: then ~ Error :} {: else ~ No Error :} :] -- :)',
    {
        all: [
            {
                two: 'sloff',
                error: {
                    message: 'error message'
                }
            },
            {
            }
        ]
    },
    function (result) { assert.strictEqual (result, 'Error  -- No Error --'); }
);

bind.to (
    '(: all ~ [: if[error] ~ {: then ~ |: message :| :} {: else ~ No Error :} :] -- :)',
    {
        all: [
            {
                two: 'sloff',
                error: {
                    message: 'error message'
                }
            },
            {
            }
        ]
    },
    function (result) { assert.strictEqual (result, 'error message  -- No Error --'); }
);

bind.to("(: aaa ~ [: bbb ~ {: ccc ~ |: ddd ~ def :| :} :] :)", {}, function(data) { assert.equal(data, "def"); });

/*
### Embed files:
####The Markup:
    <div>(:file ~ ./sales-report.txt:)</div>
####The Code:
    var bind = require("bind");

    bind.toFile("./file.html", {}, 
                function callback(data) { /* data === <div>...file contents...</div>  });

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
                function callback(data) { /* data === <div>...unescaped file contents...</div>  });
*/