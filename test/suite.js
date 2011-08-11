/* FIXME: migrate towards jasmine */
var assert = require ('assert');
var myBind = require ('../');

myBind.to ('(:no-default-worked?:)',
    {'no-default-worked?': 'yes it worked'},
    function (data) {
	assert.strictEqual (data, 'yes it worked');
    }
);

myBind.to ('(:default-worked? ~ default value worked:)',
    {},
    function (data) {
        assert.strictEqual (data, 'default value worked');
    }
);

myBind.to ('(:function-worked? ~ default value worked:)',
    {
        "function-worked?":  function(callback, def) { callback("it worked: " + def); }
    },
    function (data) {
        assert.strictEqual (data, 'it worked: default value worked');
    }
);

myBind.to ('(:number-worked?:)',
    {
        'number-worked?': 1
    },
    function (data) {
        assert.strictEqual (data, '1');
    }
);

myBind.to ('(:boolean-false ~ hi:)',
    {
        'boolean-false': false
    },
    function (data) {
        assert.strictEqual (data, '');
    }
);

myBind.to ('(:boolean-true ~ hi [: number-worked? :] :)',
    {
        'boolean-true': true,
        'number-worked?': 1
    },
    function (data) {
        assert.strictEqual (data, 'hi 1');
    }
);

/* escape test */
myBind.to ('(^\: (\: [\: {\: |\: \\: :\\ :\| :\} :\] :\) :\^)',
    {},
    function (data) {
        assert.strictEqual (data, ' (: [: {: |: \\: :\\ :| :} :] :) ');
    }
);

/* nested escape test */
myBind.to (
    '(: blahdah ~ (^\: (\: [\: {\: |\: \\:  :\\ :\| :\} :\] :\) :\^) :)',
    {},
    function (data) {
        assert.strictEqual (data, ' (: [: {: |: \\:  :\\ :| :} :] :) ');
    }
);

/* nested function call escape test */
myBind.to (
    '(: noop ~ (^\: (\: [\: {\: |\: \\:  :\\ :\| :\} :\] :\) :\^) :)',
    {
        noop: function (callback, data) {
            callback (data);
        }
    },
    function (data) {
        assert.strictEqual (data, ' (: [: {: |: \\:  :\\ :| :} :] :) ');
    }
);

myBind.to (
    'Two squared is (:square ~ 2:)',
    {
        square: function (callback, data) {
            callback(data * data);
        }
    },
    function (data) {
        assert.strictEqual (data, 'Two squared is 4');
    }
);

myBind.to (
    '(:zero-val:)',
    {
        "zero-val": 0
    },
    function (data) {
        assert.strictEqual (data, '0');
    }
);

/* array test */

myBind.to (
    '<div>(:blog-entry ~\n' +
    '    <h3>[:blog-title:]</h3>\n' +
    '    <span>[:publish-date:]</span>\n' +
    ':)\n' +
    '</div>',
    {
        "blog-entry": [
            { "blog-title": "The Sun Shines", "publish-date": "Jan 1, 1984" },
            { "blog-title": "The Moon Glows", "publish-date": "Jan 19, 1984" },
            { "blog-title": "Happy V-Day", "publish-date": "Feb 14, 1984" }
        ]

    },
    function (data) {
        assert.strictEqual (data,
            '<div><h3>The Sun Shines</h3>\n' +
            '    <span>Jan 1, 1984</span>' +
            '<h3>The Moon Glows</h3>\n' +
            '    <span>Jan 19, 1984</span>' +
            '<h3>Happy V-Day</h3>\n' +
            '    <span>Feb 14, 1984</span>\n' +
            '</div>');
    }
);

/* if -- then -- else if -- else */
myBind.to (
    '',
    {},
    function (data) {
        /* FIXME: write this test */
        assert.strictEqual (data, '');
    }
);

/* object test */
var myDate = new Date();
myBind.to (
    '(: page-info ~\n' +
    '    <ul>\n' +
    '        <li>Date: [:date:]</li>\n' +
    '        <li>Name: [:my-name ~ Who knows:]</li>\n' +
    '        <li>Page: [:page-number:]</li>\n' +
    '        <li>PWD: [:file ~ ./pwd.txt:]</li>\n' +
    '    </ul>\n' +
    ':)',
    {
        "page-info": {
            date: function (callback) {
                callback(myDate);
            },
            "my-name": "Xavi Ramirez",
            "page-number": 4
        }
    },
    function (data) {
        assert.strictEqual (data,
            '<ul>\n' +
            '        <li>Date: ' + myDate.toString() + '</li>\n' +
            '        <li>Name: Xavi Ramirez</li>\n' +
            '        <li>Page: 4</li>\n' +
            '        <li>PWD: my password..., <span>escape test: (^: (: [: {: |: \\\\:  :\\\\ :| :} :] :) :^)</span>\n\n</li>\n' +
            '    </ul>');
    }
);

/* test embedding an outbound file */
myBind.to (
    '(: file^ ~ ./pwd.txt :)',
    {
    },
    function (data) {
        assert.strictEqual (data, 'my password..., <span>escape test: (^: (: [: {: |: \\\\:  :\\\\ :| :} :] :) :^)</span>\n\n(: #:second:# ~ this is text coming from a file to an anchor point :)');
    }
);
myBind.to (
    '<pre>\n' +
    '(:file^ ~ ./something.js :)\n' +
    '</pre>',
    {},
    function (data) {
        assert.strictEqual (data, '<pre>\nvar something = new Date();\n\n</pre>');
    }
);

/* super nested */
myBind.to (
    '<table>\n' +
    '    <tr><th colspan=2>(:month-name:)</th></tr>\n' +
    '    (: weeks ~\n' +
    '    <tr>\n' +
    '        <th>[:week-name:]</th>\n' +
    '        [: days ~\n' +
    '        <td> \n' +
    '            <span class="day">{:day:}</span> - <span class="date">{:date:}</span>\n' +
    '            <ol>{: events ~\n' +
    '                <li class="|:event-type:|" colspan=|:days:|>\n' +
    '                    <h3>|:event-name:|</h3>\n' +
    '                    <h4>The Guests:</h4>\n' +
    '                    <ul>\n' +
    '                        |:guest-list ~ <li>/:name:/</li>:|\n' +
    '                    </ul>\n' +
    '                </li>:}\n' +
    '            </ol>\n' +
    '        </td>:]\n' +
    '    </tr>:)\n' +
    '</table>',
    {
        "month-name": "March",
        "weeks": [
            {
                "week-name": "week one",
                "days": [
                    {
                        "day": "Monday",
                        "date": "15th",
                        "events": {
                            "event-name": "Pre Booze", 
                            "guest-list": [
                                { "name": "Larry" }, 
                                { "name": "Carl" }
                            ]
                        }
                    },
                    {
                        "day": "Wednesday",
                        "date": "17th",
                        "events": {
                            "event-name": "St. Patrick's",
                            "guest-list": [
                                {
                                    "name": "The Irish"
                                }, 
                                {
                                    "name": "Everyone Else"
                                }
                            ]
                        }
                    },
                    {
                        "day": "Friday",
                        "date": "19th",
                        "events": {
                            "event-name": "Slam Dance",
                            "guest-list": [
                                {
                                    "name": "Julie"
                                }, 
                                {
                                    "name": "Jorge"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "week-name": "week two",
                "days": [
                    {
                        "day": "Tuesday",
                        "date": "23th",
                        "events": {
                            "event-name": "Rally Rock",
                            "guest-list": [
                                {
                                    "name": "Bobo"
                                }, 
                                {
                                    "name": "Lembley"
                                }
                            ]
                        }
                    },
                    {
                        "day": "Wednesday",
                        "date": "24th",
                        "events": {
                            "event-name": "Willy Woo Wonderland",
                            "guest-list": [
                                {
                                    "name": "Alice"
                                }, 
                                {
                                    "name": "Eliza"
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    },
    function (data) {
        var expected = 
                '<table>\n' +
                '    <tr><th colspan=2>March</th></tr>\n' +
                '    <tr>\n' +
                '        <th>week one</th>\n' +
                '        <td> \n' +
                '            <span class="day">Monday</span> - <span class="date">15th</span>\n' +
                '            <ol><li class="" colspan=>\n' +
                '                    <h3>Pre Booze</h3>\n' +
                '                    <h4>The Guests:</h4>\n' +
                '                    <ul>\n' +
                '                        <li>Larry</li><li>Carl</li>\n' +
                '                    </ul>\n' +
                '                </li>\n' +
                '            </ol>\n' +
                '        </td><td> \n' +
                '            <span class="day">Wednesday</span> - <span class="date">17th</span>\n' +
                '            <ol><li class="" colspan=>\n' +
                '                    <h3>St. Patrick\'s</h3>\n' +
                '                    <h4>The Guests:</h4>\n' +
                '                    <ul>\n' +
                '                        <li>The Irish</li><li>Everyone Else</li>\n' +
                '                    </ul>\n' +
                '                </li>\n' +
                '            </ol>\n' +
                '        </td><td> \n' +
                '            <span class="day">Friday</span> - <span class="date">19th</span>\n' +
                '            <ol><li class="" colspan=>\n' +
                '                    <h3>Slam Dance</h3>\n' +
                '                    <h4>The Guests:</h4>\n' +
                '                    <ul>\n' +
                '                        <li>Julie</li><li>Jorge</li>\n' +
                '                    </ul>\n' +
                '                </li>\n' +
                '            </ol>\n' +
                '        </td>\n' +
                '    </tr><tr>\n' +
                '        <th>week two</th>\n' +
                '        <td> \n' +
                '            <span class="day">Tuesday</span> - <span class="date">23th</span>\n' +
                '            <ol><li class="" colspan=>\n' +
                '                    <h3>Rally Rock</h3>\n' +
                '                    <h4>The Guests:</h4>\n' +
                '                    <ul>\n' +
                '                        <li>Bobo</li><li>Lembley</li>\n' +
                '                    </ul>\n' +
                '                </li>\n' +
                '            </ol>\n' +
                '        </td><td> \n' +
                '            <span class="day">Wednesday</span> - <span class="date">24th</span>\n' +
                '            <ol><li class="" colspan=>\n' +
                '                    <h3>Willy Woo Wonderland</h3>\n' +
                '                    <h4>The Guests:</h4>\n' +
                '                    <ul>\n' +
                '                        <li>Alice</li><li>Eliza</li>\n' +
                '                    </ul>\n' +
                '                </li>\n' +
                '            </ol>\n' +
                '        </td>\n' +
                '    </tr>\n' +
                '</table>';

        for (var i = 0; i < data.length; i += 20) {
            assert.strictEqual (data.substr (i, 20), expected.substr (i, 20));
        }
    }
);

/* undefined in lists */
var myArray = new Array(7);
myArray[0] = {};
myArray[1] = {};
myArray[2] = {};
myArray[3] = {
    name: 'hello'
};
myBind.to (
    'seven things: \n' +
    '<ul>\n' +
    '    (:list ~ <li>[:name ~ no-name :]</li> :)\n' +
    '</ul>',
    {
        list: myArray
    },
    function (data) {
        assert.strictEqual (data, 'seven things: \n<ul>\n    <li>no-name</li><li>no-name</li><li>no-name</li><li>hello</li><li></li><li></li><li></li>\n</ul>');
    }
);

/* test null */
myBind.to (
    '(:foo ~ bar:)',
    {
        foo: null
    },
    function (result) {
        assert.strictEqual (result, '');
    }
);

/* test undefined */
myBind.to (
    '(:wee ~ poo:)',
    {},
    function (result) {
        assert.strictEqual (result, 'poo');
    }
);

/* test 0 */
myBind.to (
    '(:zero ~ non-zero:)',
    {
        zero: 0
    },
    function (result) {
        assert.strictEqual (result, '0');
    }
);

/* anchor points */
myBind.to (
    'one\n' +
    '#:TWO:#\n' +
    'three\n' +
    '(: #:TWO:# ~ two :)',
    {},
    function (result) {
        assert.strictEqual (result, 'one\ntwo\nthree\n');
    }
);

/* vim:set sw=4 et: */
