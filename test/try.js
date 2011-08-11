var assert = require ('assert');
var bind = require ('../');

bind.to (
    '(: all ~ [:if[error] ~ {: then ~ Error :} {: else ~ No Error :} :] -- :)',
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
    function (result) {
        assert.strictEqual (result, 'Error  -- No Error --');
    }
);

bind.to (
    '(: all ~ [:if[error] ~ {: then ~ |: error ~ /: message :/ :| :} {: else ~ No Error :} :] -- :)',
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
    function (result) {
        assert.strictEqual (result, 'error message  -- No Error --');
    }
);

