var parse = require('../');
var test = require('tape');

test('IsNumber with real number', function (t) {
    var argv = parse([
        '-x', 1234
    ]);
    t.deepEqual(argv, {
        _: [],
        x: 1234
    });

    t.end();
});

