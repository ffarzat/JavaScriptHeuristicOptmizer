(function() {
  var _ = typeof require == 'function' ? require('..') : this._;
  
  QUnit.module('Arrays');

  test('first', function() {
    equal(_.first([1, 2, 3]), 1, 'can pull out the first element of an array');
    equal(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');
    deepEqual(_.first([1, 2, 3], 0), [], 'can pass an index to first');
    deepEqual(_.first([1, 2, 3], 2), [1, 2], 'can pass an index to first');
    deepEqual(_.first([1, 2, 3], 5), [1, 2, 3], 'can pass an index to first');
    var result = (function(){ return _.first(arguments); }(4, 3, 2, 1));
    equal(result, 4, 'works on an arguments object.');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.first);
    deepEqual(result, [1, 1], 'works well with _.map');
    result = (function() { return _.first([1, 2, 3], 2); }());
    deepEqual(result, [1, 2]);

    equal(_.first(null), undefined, 'handles nulls');
    strictEqual(_.first([1, 2, 3], -1).length, 0);
  });

  test('head', function() {
    strictEqual(_.first, _.head, 'alias for first');
  });

  test('take', function() {
    strictEqual(_.first, _.take, 'alias for first');
  });

  test('rest', function() {
    var numbers = [1, 2, 3, 4];
    deepEqual(_.rest(numbers), [2, 3, 4], 'working rest()');
    deepEqual(_.rest(numbers, 0), [1, 2, 3, 4], 'working rest(0)');
    deepEqual(_.rest(numbers, 2), [3, 4], 'rest can take an index');
    var result = (function(){ return _(arguments).rest(); }(1, 2, 3, 4));
    deepEqual(result, [2, 3, 4], 'works on arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.rest);
    deepEqual(_.flatten(result), [2, 3, 2, 3], 'works well with _.map');
    result = (function(){ return _(arguments).rest(); }(1, 2, 3, 4));
    deepEqual(result, [2, 3, 4], 'works on arguments object');
  });

  test('tail', function() {
    strictEqual(_.rest, _.tail, 'alias for rest');
  });

  test('drop', function() {
    strictEqual(_.rest, _.drop, 'alias for rest');
  });

  test('initial', function() {
    deepEqual(_.initial([1, 2, 3, 4, 5]), [1, 2, 3, 4], 'working initial()');
    deepEqual(_.initial([1, 2, 3, 4], 2), [1, 2], 'initial can take an index');
    deepEqual(_.initial([1, 2, 3, 4], 6), [], 'initial can take a large index');
    var result = (function(){ return _(arguments).initial(); }(1, 2, 3, 4));
    deepEqual(result, [1, 2, 3], 'initial works on arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.initial);
    deepEqual(_.flatten(result), [1, 2, 1, 2], 'initial works with _.map');
  });

  test('last', function() {
    equal(_.last([1, 2, 3]), 3, 'can pull out the last element of an array');
    deepEqual(_.last([1, 2, 3], 0), [], 'can pass an index to last');
    deepEqual(_.last([1, 2, 3], 2), [2, 3], 'can pass an index to last');
    deepEqual(_.last([1, 2, 3], 5), [1, 2, 3], 'can pass an index to last');
    var result = (function(){ return _(arguments).last(); }(1, 2, 3, 4));
    equal(result, 4, 'works on an arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.last);
    deepEqual(result, [3, 3], 'works well with _.map');

    equal(_.last(null), undefined, 'handles nulls');
    strictEqual(_.last([1, 2, 3], -1).length, 0);
  });

  test('compact', function() {
    equal(_.compact([0, 1, false, 2, false, 3]).length, 3, 'can trim out all falsy values');
    var result = (function(){ return _.compact(arguments).length; }(0, 1, false, 2, false, 3));
    equal(result, 3, 'works on an arguments object');
  });

  test('flatten', function() {
    deepEqual(_.flatten(null), [], 'Flattens supports null');
    deepEqual(_.flatten(void 0), [], 'Flattens supports undefined');

    deepEqual(_.flatten([[], [[]], []]), [], 'Flattens empty arrays');
    deepEqual(_.flatten([[], [[]], []], true), [[]], 'Flattens empty arrays');

    var list = [1, [2], [3, [[[4]]]]];
    deepEqual(_.flatten(list), [1, 2, 3, 4], 'can flatten nested arrays');
    deepEqual(_.flatten(list, true), [1, 2, 3, [[[4]]]], 'can shallowly flatten nested arrays');
    var result = (function(){ return _.flatten(arguments); }(1, [2], [3, [[[4]]]]));
    deepEqual(result, [1, 2, 3, 4], 'works on an arguments object');
    list = [[1], [2], [3], [[4]]];
    deepEqual(_.flatten(list, true), [1, 2, 3, [4]], 'can shallowly flatten arrays containing only other arrays');

    equal(_.flatten([_.range(10), _.range(10), 5, 1, 3], true).length, 23);
    equal(_.flatten([_.range(10), _.range(10), 5, 1, 3]).length, 23);
    equal(_.flatten([new Array(1000000), _.range(56000), 5, 1, 3]).length, 1056003, 'Flatten can handle massive collections');
    equal(_.flatten([new Array(1000000), _.range(56000), 5, 1, 3], true).length, 1056003, 'Flatten can handle massive collections');
  });

  test('without', function() {
    var list = [1, 2, 1, 0, 3, 1, 4];
    deepEqual(_.without(list, 0, 1), [2, 3, 4], 'can remove all instances of an object');
    var result = (function(){ return _.without(arguments, 0, 1); }(1, 2, 1, 0, 3, 1, 4));
    deepEqual(result, [2, 3, 4], 'works on an arguments object');

    list = [{one : 1}, {two : 2}];
    equal(_.without(list, {one : 1}).length, 2, 'uses real object identity for comparisons.');
    equal(_.without(list, list[0]).length, 1, 'ditto.');
  });

  test('sortedIndex', function() {
    var numbers = [10, 20, 30, 40, 50], num = 35;
    var indexForNum = _.sortedIndex(numbers, num);
    equal(indexForNum, 3, '35 should be inserted at index 3');

    var indexFor30 = _.sortedIndex(numbers, 30);
    equal(indexFor30, 2, '30 should be inserted at index 2');

    var objects = [{x: 10}, {x: 20}, {x: 30}, {x: 40}];
    var iterator = function(obj){ return obj.x; };
    strictEqual(_.sortedIndex(objects, {x: 25}, iterator), 2);
    strictEqual(_.sortedIndex(objects, {x: 35}, 'x'), 3);

    var context = {1: 2, 2: 3, 3: 4};
    iterator = function(obj){ return this[obj]; };
    strictEqual(_.sortedIndex([1, 3], 2, iterator, context), 1);

    var values = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535, 131071, 262143, 524287, 1048575, 2097151, 4194303, 8388607, 16777215, 33554431, 67108863, 134217727, 268435455, 536870911, 1073741823, 2147483647];
    var array = Array(Math.pow(2, 32) - 1);
    var length = values.length;
    while (length--) {
      array[values[length]] = values[length];
    }
    equal(_.sortedIndex(array, 2147483648), 2147483648, 'should work with large indexes');
  });

  test('uniq', function() {
    var list = [1, 2, 1, 3, 1, 4];
    deepEqual(_.uniq(list), [1, 2, 3, 4], 'can find the unique values of an unsorted array');

    list = [1, 1, 1, 2, 2, 3];
    deepEqual(_.uniq(list, true), [1, 2, 3], 'can find the unique values of a sorted array faster');

    list = [{name: 'moe'}, {name: 'curly'}, {name: 'larry'}, {name: 'curly'}];
    var iterator = function(value) { return value.name; };
    deepEqual(_.map(_.uniq(list, false, iterator), iterator), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator');

    deepEqual(_.map(_.uniq(list, iterator), iterator), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator without specifying whether array is sorted');

    iterator = function(value) { return value + 1; };
    list = [1, 2, 2, 3, 4, 4];
    deepEqual(_.uniq(list, true, iterator), [1, 2, 3, 4], 'iterator works with sorted array');

    var kittens = [
      {kitten: 'Celery', cuteness: 8},
      {kitten: 'Juniper', cuteness: 10},
      {kitten: 'Spottis', cuteness: 10}
    ];

    var expected = [
      {kitten: 'Celery', cuteness: 8},
      {kitten: 'Juniper', cuteness: 10}
    ];

    deepEqual(_.uniq(kittens, true, 'cuteness'), expected, 'string iterator works with sorted array');


    var result = (function(){ return _.uniq(arguments); }(1, 2, 1, 3, 1, 4));
    deepEqual(result, [1, 2, 3, 4], 'works on an arguments object');

    var a = {}, b = {}, c = {};
    deepEqual(_.uniq([a, b, a, b, c]), [a, b, c], 'works on values that can be tested for equivalency but not ordered');

    deepEqual(_.uniq(null), []);

    var context = {};
    list = [3];
    _.uniq(list, function(value, index, array) {
      strictEqual(this, context);
      strictEqual(value, 3);
      strictEqual(index, 0);
      strictEqual(array, list);
    }, context);

    deepEqual(_.uniq([{a: 1, b: 1}, {a: 1, b: 2}, {a: 1, b: 3}, {a: 2, b: 1}], 'a'), [{a: 1, b: 1}, {a: 2, b: 1}], 'can use pluck like iterator');
    deepEqual(_.uniq([{0: 1, b: 1}, {0: 1, b: 2}, {0: 1, b: 3}, {0: 2, b: 1}], 0), [{0: 1, b: 1}, {0: 2, b: 1}], 'can use falsey pluck like iterator');
  });

  test('unique', function() {
    strictEqual(_.uniq, _.unique, 'alias for uniq');
  });

  test('intersection', function() {
    var stooges = ['moe', 'curly', 'larry'], leaders = ['moe', 'groucho'];
    deepEqual(_.intersection(stooges, leaders), ['moe'], 'can take the set intersection of two arrays');
    deepEqual(_(stooges).intersection(leaders), ['moe'], 'can perform an OO-style intersection');
    var result = (function(){ return _.intersection(arguments, leaders); }('moe', 'curly', 'larry'));
    deepEqual(result, ['moe'], 'works on an arguments object');
    var theSixStooges = ['moe', 'moe', 'curly', 'curly', 'larry', 'larry'];
    deepEqual(_.intersection(theSixStooges, leaders), ['moe'], 'returns a duplicate-free array');
    result = _.intersection([2, 4, 3, 1], [1, 2, 3]);
    deepEqual(result, [2, 3, 1], 'preserves order of first array');
    result = _.intersection(null, [1, 2, 3]);
    equal(Object.prototype.toString.call(result), '[object Array]', 'returns an empty array when passed null as first argument');
    equal(result.length, 0, 'returns an empty array when passed null as first argument');
    result = _.intersection([1, 2, 3], null);
    equal(Object.prototype.toString.call(result), '[object Array]', 'returns an empty array when passed null as argument beyond the first');
    equal(result.length, 0, 'returns an empty array when passed null as argument beyond the first');
  });

  test('union', function() {
    var result = _.union([1, 2, 3], [2, 30, 1], [1, 40]);
    deepEqual(result, [1, 2, 3, 30, 40], 'takes the union of a list of arrays');

    result = _.union([1, 2, 3], [2, 30, 1], [1, 40, [1]]);
    deepEqual(result, [1, 2, 3, 30, 40, [1]], 'takes the union of a list of nested arrays');

    var args = null;
    (function(){ args = arguments; }(1, 2, 3));
    result = _.union(args, [2, 30, 1], [1, 40]);
    deepEqual(result, [1, 2, 3, 30, 40], 'takes the union of a list of arrays');

    result = _.union([1, 2, 3], 4);
    deepEqual(result, [1, 2, 3], 'restrict the union to arrays only');
  });

  test('difference', function() {
    var result = _.difference([1, 2, 3], [2, 30, 40]);
    deepEqual(result, [1, 3], 'takes the difference of two arrays');

    result = _.difference([1, 2, 3, 4], [2, 30, 40], [1, 11, 111]);
    deepEqual(result, [3, 4], 'takes the difference of three arrays');

    result = _.difference([1, 2, 3], 1);
    deepEqual(result, [1, 2, 3], 'restrict the difference to arrays only');
  });

  test('zip', function() {
    var names = ['moe', 'larry', 'curly'], ages = [30, 40, 50], leaders = [true];
    deepEqual(_.zip(names, ages, leaders), [
      ['moe', 30, true],
      ['larry', 40, undefined],
      ['curly', 50, undefined]
    ], 'zipped together arrays of different lengths');

    var stooges = _.zip(['moe', 30, 'stooge 1'], ['larry', 40, 'stooge 2'], ['curly', 50, 'stooge 3']);
    deepEqual(stooges, [['moe', 'larry', 'curly'], [30, 40, 50], ['stooge 1', 'stooge 2', 'stooge 3']], 'zipped pairs');

    // In the case of difference lengths of the tuples undefineds
    // should be used as placeholder
    stooges = _.zip(['moe', 30], ['larry', 40], ['curly', 50, 'extra data']);
    deepEqual(stooges, [['moe', 'larry', 'curly'], [30, 40, 50], [undefined, undefined, 'extra data']], 'zipped pairs with empties');

    var empty = _.zip([]);
    deepEqual(empty, [], 'unzipped empty');

    deepEqual(_.zip(null), [], 'handles null');
    deepEqual(_.zip(), [], '_.zip() returns []');
  });

  test('unzip', function() {
    deepEqual(_.unzip(null), [], 'handles null');

    deepEqual(_.unzip([['a', 'b'], [1, 2]]), [['a', 1], ['b', 2]]);

    // complements zip
    var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
    deepEqual(_.unzip(zipped), [['fred', 'barney'], [30, 40], [true, false]]);

    zipped = _.zip(['moe', 30], ['larry', 40], ['curly', 50, 'extra data']);
    deepEqual(_.unzip(zipped), [['moe', 30, void 0], ['larry', 40, void 0], ['curly', 50, 'extra data']], 'Uses length of largest array');
  });

  test('object', function() {
    var result = _.object(['moe', 'larry', 'curly'], [30, 40, 50]);
    var shouldBe = {moe: 30, larry: 40, curly: 50};
    deepEqual(result, shouldBe, 'two arrays zipped together into an object');

    result = _.object([['one', 1], ['two', 2], ['three', 3]]);
    shouldBe = {one: 1, two: 2, three: 3};
    deepEqual(result, shouldBe, 'an array of pairs zipped together into an object');

    var stooges = {moe: 30, larry: 40, curly: 50};
    deepEqual(_.object(_.pairs(stooges)), stooges, 'an object converted to pairs and back to an object');

    deepEqual(_.object(null), {}, 'handles nulls');
  });

  test('indexOf', function() {
    var numbers = [1, 2, 3];
    equal(_.indexOf(numbers, 2), 1, 'can compute indexOf');
    var result = (function(){ return _.indexOf(arguments, 2); }(1, 2, 3));
    equal(result, 1, 'works on an arguments object');

    _.each([null, void 0, [], false], function(val) {
      var msg = 'Handles: ' + (_.isArray(val) ? '[]' : val);
      equal(_.indexOf(val, 2), -1, msg);
      equal(_.indexOf(val, 2, -1), -1, msg);
      equal(_.indexOf(val, 2, -20), -1, msg);
      equal(_.indexOf(val, 2, 15), -1, msg);
    });

    var num = 35;
    numbers = [10, 20, 30, 40, 50];
    var index = _.indexOf(numbers, num, true);
    equal(index, -1, '35 is not in the list');

    numbers = [10, 20, 30, 40, 50]; num = 40;
    index = _.indexOf(numbers, num, true);
    equal(index, 3, '40 is in the list');

    numbers = [1, 40, 40, 40, 40, 40, 40, 40, 50, 60, 70]; num = 40;
    equal(_.indexOf(numbers, num, true), 1, '40 is in the list');
    equal(_.indexOf(numbers, 6, true), -1, '6 isnt in the list');
    equal(_.indexOf([1, 2, 5, 4, 6, 7], 5, true), -1, 'sorted indexOf doesn\'t uses binary search');
    ok(_.every(['1', [], {}, null], function() {
      return _.indexOf(numbers, num, {}) === 1;
    }), 'non-nums as fromIndex make indexOf assume sorted');

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    index = _.indexOf(numbers, 2, 5);
    equal(index, 7, 'supports the fromIndex argument');

    index = _.indexOf([,,,], undefined);
    equal(index, 0, 'treats sparse arrays as if they were dense');

    var array = [1, 2, 3, 1, 2, 3];
    strictEqual(_.indexOf(array, 1, -3), 3, 'neg `fromIndex` starts at the right index');
    strictEqual(_.indexOf(array, 1, -2), -1, 'neg `fromIndex` starts at the right index');
    strictEqual(_.indexOf(array, 2, -3), 4);
    _.each([-6, -8, -Infinity], function(fromIndex) {
      strictEqual(_.indexOf(array, 1, fromIndex), 0);
    });
    strictEqual(_.indexOf([1, 2, 3], 1, true), 0);

    index = _.indexOf([], undefined, true);
    equal(index, -1, 'empty array with truthy `isSorted` returns -1');
  });

  test('indexOf with NaN', function() {
    strictEqual(_.indexOf([1, 2, NaN, NaN], NaN), 2, 'Expected [1, 2, NaN] to contain NaN');
    strictEqual(_.indexOf([1, 2, Infinity], NaN), -1, 'Expected [1, 2, NaN] to contain NaN');

    strictEqual(_.indexOf([1, 2, NaN, NaN], NaN, 1), 2, 'startIndex does not affect result');
    strictEqual(_.indexOf([1, 2, NaN, NaN], NaN, -2), 2, 'startIndex does not affect result');

    (function() {
      strictEqual(_.indexOf(arguments, NaN), 2, 'Expected arguments [1, 2, NaN] to contain NaN');
    }(1, 2, NaN, NaN));
  });

  test('indexOf with +- 0', function() {
    _.each([-0, +0], function(val) {
      strictEqual(_.indexOf([1, 2, val, val], val), 2);
      strictEqual(_.indexOf([1, 2, val, val], -val), 2);
    });
  });

  test('lastIndexOf', function() {
    var numbers = [1, 0, 1];
    var falsey = [void 0, '', 0, false, NaN, null, undefined];
    equal(_.lastIndexOf(numbers, 1), 2);

    numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
    numbers.lastIndexOf = null;
    equal(_.lastIndexOf(numbers, 1), 5, 'can compute lastIndexOf, even without the native function');
    equal(_.lastIndexOf(numbers, 0), 8, 'lastIndexOf the other element');
    var result = (function(){ return _.lastIndexOf(arguments, 1); }(1, 0, 1, 0, 0, 1, 0, 0, 0));
    equal(result, 5, 'works on an arguments object');

    _.each([null, void 0, [], false], function(val) {
      var msg = 'Handles: ' + (_.isArray(val) ? '[]' : val);
      equal(_.lastIndexOf(val, 2), -1, msg);
      equal(_.lastIndexOf(val, 2, -1), -1, msg);
      equal(_.lastIndexOf(val, 2, -20), -1, msg);
      equal(_.lastIndexOf(val, 2, 15), -1, msg);
    });

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    var index = _.lastIndexOf(numbers, 2, 2);
    equal(index, 1, 'supports the fromIndex argument');

    var array = [1, 2, 3, 1, 2, 3];

    strictEqual(_.lastIndexOf(array, 1, 0), 0, 'starts at the correct from idx');
    strictEqual(_.lastIndexOf(array, 3), 5, 'should return the index of the last matched value');
    strictEqual(_.lastIndexOf(array, 4), -1, 'should return `-1` for an unmatched value');

    strictEqual(_.lastIndexOf(array, 1, 2), 0, 'should work with a positive `fromIndex`');

    _.each([6, 8, Math.pow(2, 32), Infinity], function(fromIndex) {
      strictEqual(_.lastIndexOf(array, undefined, fromIndex), -1);
      strictEqual(_.lastIndexOf(array, 1, fromIndex), 3);
      strictEqual(_.lastIndexOf(array, '', fromIndex), -1);
    });

    var expected = _.map(falsey, function(value) {
      return typeof value == 'number' ? -1 : 5;
    });

    var actual = _.map(falsey, function(fromIndex) {
      return _.lastIndexOf(array, 3, fromIndex);
    });

    deepEqual(actual, expected, 'should treat falsey `fromIndex` values, except `0` and `NaN`, as `array.length`');
    strictEqual(_.lastIndexOf(array, 3, '1'), 5, 'should treat non-number `fromIndex` values as `array.length`');
    strictEqual(_.lastIndexOf(array, 3, true), 5, 'should treat non-number `fromIndex` values as `array.length`');

    strictEqual(_.lastIndexOf(array, 2, -3), 1, 'should work with a negative `fromIndex`');
    strictEqual(_.lastIndexOf(array, 1, -3), 3, 'neg `fromIndex` starts at the right index');

    deepEqual(_.map([-6, -8, -Infinity], function(fromIndex) {
      return _.lastIndexOf(array, 1, fromIndex);
    }), [0, -1, -1]);
  });

  test('lastIndexOf with NaN', function() {
    strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN), 3, 'Expected [1, 2, NaN] to contain NaN');
    strictEqual(_.lastIndexOf([1, 2, Infinity], NaN), -1, 'Expected [1, 2, NaN] to contain NaN');

    strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN, 2), 2, 'fromIndex does not affect result');
    strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN, -2), 2, 'fromIndex does not affect result');

    (function() {
      strictEqual(_.lastIndexOf(arguments, NaN), 3, 'Expected arguments [1, 2, NaN] to contain NaN');
    }(1, 2, NaN, NaN));
  });

  test('lastIndexOf with +- 0', function() {
    _.each([-0, +0], function(val) {
      strictEqual(_.lastIndexOf([1, 2, val, val], val), 3);
      strictEqual(_.lastIndexOf([1, 2, val, val], -val), 3);
      strictEqual(_.lastIndexOf([-1, 1, 2], -val), -1);
    });
  });

  test('findIndex', function() {
    var objects = [
      {'a': 0, 'b': 0},
      {'a': 1, 'b': 1},
      {'a': 2, 'b': 2},
      {'a': 0, 'b': 0}
    ];

    equal(_.findIndex(objects, function(obj) {
      return obj.a === 0;
    }), 0);

    equal(_.findIndex(objects, function(obj) {
      return obj.b * obj.a === 4;
    }), 2);

    equal(_.findIndex(objects, 'a'), 1, 'Uses lookupIterator');

    equal(_.findIndex(objects, function(obj) {
      return obj.b * obj.a === 5;
    }), -1);

    equal(_.findIndex(null, _.noop), -1);
    strictEqual(_.findIndex(objects, function(a) {
      return a.foo === null;
    }), -1);
    _.findIndex([{a: 1}], function(a, key, obj) {
      equal(key, 0);
      deepEqual(obj, [{a: 1}]);
      strictEqual(this, objects, 'called with context');
    }, objects);

    var sparse = [];
    sparse[20] = {'a': 2, 'b': 2};
    equal(_.findIndex(sparse, function(obj) {
      return obj && obj.b * obj.a === 4;
    }), 20, 'Works with sparse arrays');

    var array = [1, 2, 3, 4];
    array.match = 55;
    strictEqual(_.findIndex(array, function(x) { return x === 55; }), -1, 'doesn\'t match array-likes keys');
  });

  test('findLastIndex', function() {
    var objects = [
      {'a': 0, 'b': 0},
      {'a': 1, 'b': 1},
      {'a': 2, 'b': 2},
      {'a': 0, 'b': 0}
    ];

    equal(_.findLastIndex(objects, function(obj) {
      return obj.a === 0;
    }), 3);

    equal(_.findLastIndex(objects, function(obj) {
      return obj.b * obj.a === 4;
    }), 2);

    equal(_.findLastIndex(objects, 'a'), 2, 'Uses lookupIterator');

    equal(_.findLastIndex(objects, function(obj) {
      return obj.b * obj.a === 5;
    }), -1);

    equal(_.findLastIndex(null, _.noop), -1);
    strictEqual(_.findLastIndex(objects, function(a) {
      return a.foo === null;
    }), -1);
    _.findLastIndex([{a: 1}], function(a, key, obj) {
      equal(key, 0);
      deepEqual(obj, [{a: 1}]);
      strictEqual(this, objects, 'called with context');
    }, objects);

    var sparse = [];
    sparse[20] = {'a': 2, 'b': 2};
    equal(_.findLastIndex(sparse, function(obj) {
      return obj && obj.b * obj.a === 4;
    }), 20, 'Works with sparse arrays');

    var array = [1, 2, 3, 4];
    array.match = 55;
    strictEqual(_.findLastIndex(array, function(x) { return x === 55; }), -1, 'doesn\'t match array-likes keys');
  });

  test('range', function() {
    deepEqual(_.range(0), [], 'range with 0 as a first argument generates an empty array');
    deepEqual(_.range(4), [0, 1, 2, 3], 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
    deepEqual(_.range(5, 8), [5, 6, 7], 'range with two arguments a &amp; b, a&lt;b generates an array of elements a,a+1,a+2,...,b-2,b-1');
    deepEqual(_.range(8, 5), [], 'range with two arguments a &amp; b, b&lt;a generates an empty array');
    deepEqual(_.range(3, 10, 3), [3, 6, 9], 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
    deepEqual(_.range(3, 10, 15), [3], 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
    deepEqual(_.range(12, 7, -2), [12, 10, 8], 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
    deepEqual(_.range(0, -10, -1), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9], 'final example in the Python docs');
  });

}());



(function() {
  var _ = typeof require == 'function' ? require('..') : this._;

  QUnit.module('Chaining');

  test('map/flatten/reduce', function() {
    var lyrics = [
      'I\'m a lumberjack and I\'m okay',
      'I sleep all night and I work all day',
      'He\'s a lumberjack and he\'s okay',
      'He sleeps all night and he works all day'
    ];
    var counts = _(lyrics).chain()
      .map(function(line) { return line.split(''); })
      .flatten()
      .reduce(function(hash, l) {
        hash[l] = hash[l] || 0;
        hash[l]++;
        return hash;
    }, {}).value();
    equal(counts.a, 16, 'counted all the letters in the song');
    equal(counts.e, 10, 'counted all the letters in the song');
  });

  test('select/reject/sortBy', function() {
    var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    numbers = _(numbers).chain().select(function(n) {
      return n % 2 === 0;
    }).reject(function(n) {
      return n % 4 === 0;
    }).sortBy(function(n) {
      return -n;
    }).value();
    deepEqual(numbers, [10, 6, 2], 'filtered and reversed the numbers');
  });

  test('select/reject/sortBy in functional style', function() {
    var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    numbers = _.chain(numbers).select(function(n) {
      return n % 2 === 0;
    }).reject(function(n) {
      return n % 4 === 0;
    }).sortBy(function(n) {
      return -n;
    }).value();
    deepEqual(numbers, [10, 6, 2], 'filtered and reversed the numbers');
  });

  test('reverse/concat/unshift/pop/map', function() {
    var numbers = [1, 2, 3, 4, 5];
    numbers = _(numbers).chain()
      .reverse()
      .concat([5, 5, 5])
      .unshift(17)
      .pop()
      .map(function(n){ return n * 2; })
      .value();
    deepEqual(numbers, [34, 10, 8, 6, 4, 2, 10, 10], 'can chain together array functions.');
  });

  test('splice', function() {
    var instance = _([1, 2, 3, 4, 5]).chain();
    deepEqual(instance.splice(1, 3).value(), [1, 5]);
    deepEqual(instance.splice(1, 0).value(), [1, 5]);
    deepEqual(instance.splice(1, 1).value(), [1]);
    deepEqual(instance.splice(0, 1).value(), [], '#397 Can create empty array');
  });

  test('shift', function() {
    var instance = _([1, 2, 3]).chain();
    deepEqual(instance.shift().value(), [2, 3]);
    deepEqual(instance.shift().value(), [3]);
    deepEqual(instance.shift().value(), [], '#397 Can create empty array');
  });

  test('pop', function() {
    var instance = _([1, 2, 3]).chain();
    deepEqual(instance.pop().value(), [1, 2]);
    deepEqual(instance.pop().value(), [1]);
    deepEqual(instance.pop().value(), [], '#397 Can create empty array');
  });

  test('chaining works in small stages', function() {
    var o = _([1, 2, 3, 4]).chain();
    deepEqual(o.filter(function(i) { return i < 3; }).value(), [1, 2]);
    deepEqual(o.filter(function(i) { return i > 2; }).value(), [3, 4]);
  });

  test('#1562: Engine proxies for chained functions', function() {
    var wrapped = _(512);
    strictEqual(wrapped.toJSON(), 512);
    strictEqual(wrapped.valueOf(), 512);
    strictEqual(+wrapped, 512);
    strictEqual(wrapped.toString(), '512');
    strictEqual('' + wrapped, '512');
  });

}());




(function() {
  var _ = typeof require == 'function' ? require('..') : this._;

  QUnit.module('Collections');

  test('each', function() {
    _.each([1, 2, 3], function(num, i) {
      equal(num, i + 1, 'each iterators provide value and iteration count');
    });

    var answers = [];
    _.each([1, 2, 3], function(num){ answers.push(num * this.multiplier);}, {multiplier : 5});
    deepEqual(answers, [5, 10, 15], 'context object property accessed');

    answers = [];
    _.each([1, 2, 3], function(num){ answers.push(num); });
    deepEqual(answers, [1, 2, 3], 'aliased as "forEach"');

    answers = [];
    var obj = {one : 1, two : 2, three : 3};
    obj.constructor.prototype.four = 4;
    _.each(obj, function(value, key){ answers.push(key); });
    deepEqual(answers, ['one', 'two', 'three'], 'iterating over objects works, and ignores the object prototype.');
    delete obj.constructor.prototype.four;

    // ensure the each function is JITed
    _(1000).times(function() { _.each([], function(){}); });
    var count = 0;
    obj = {1 : 'foo', 2 : 'bar', 3 : 'baz'};
    _.each(obj, function(value, key){ count++; });
    equal(count, 3, 'the fun should be called only 3 times');

    var answer = null;
    _.each([1, 2, 3], function(num, index, arr){ if (_.include(arr, num)) answer = true; });
    ok(answer, 'can reference the original collection from inside the iterator');

    answers = 0;
    _.each(null, function(){ ++answers; });
    equal(answers, 0, 'handles a null properly');

    _.each(false, function(){});

    var a = [1, 2, 3];
    strictEqual(_.each(a, function(){}), a);
    strictEqual(_.each(null, function(){}), null);
  });

  test('forEach', function() {
    strictEqual(_.each, _.forEach, 'alias for each');
  });

  test('lookupIterator with contexts', function() {
    _.each([true, false, 'yes', '', 0, 1, {}], function(context) {
      _.each([1], function() {
        equal(this, context);
      }, context);
    });
  });

  test('Iterating objects with sketchy length properties', function() {
    var functions = [
        'each', 'map', 'filter', 'find',
        'some', 'every', 'max', 'min',
        'groupBy', 'countBy', 'partition', 'indexBy'
    ];
    var reducers = ['reduce', 'reduceRight'];

    var tricks = [
      {length: '5'},
      {
        length: {
          valueOf: _.constant(5)
        }
      },
      {length: Math.pow(2, 53) + 1},
      {length: Math.pow(2, 53)},
      {length: null},
      {length: -2},
      {length: new Number(15)}
    ];

    expect(tricks.length * (functions.length + reducers.length + 4));

    _.each(tricks, function(trick) {
      var length = trick.length;
      strictEqual(_.size(trick), 1, 'size on obj with length: ' + length);
      deepEqual(_.toArray(trick), [length], 'toArray on obj with length: ' + length);
      deepEqual(_.shuffle(trick), [length], 'shuffle on obj with length: ' + length);
      deepEqual(_.sample(trick), length, 'sample on obj with length: ' + length);


      _.each(functions, function(method) {
        _[method](trick, function(val, key) {
          strictEqual(key, 'length', method + ': ran with length = ' + val);
        });
      });

      _.each(reducers, function(method) {
        strictEqual(_[method](trick), trick.length, method);
      });
    });
  });

  test('Resistant to collection length and properties changing while iterating', function() {

    var collection = [
      'each', 'map', 'filter', 'find',
      'some', 'every', 'max', 'min', 'reject',
      'groupBy', 'countBy', 'partition', 'indexBy',
      'reduce', 'reduceRight'
    ];
    var array = [
      'findIndex', 'findLastIndex'
    ];
    var object = [
      'mapObject', 'findKey', 'pick', 'omit'
    ];

    _.each(collection.concat(array), function(method) {
      var sparseArray = [1, 2, 3];
      sparseArray.length = 100;
      var answers = 0;
      _[method](sparseArray, function(){
        ++answers;
        return method === 'every' ? true : null;
      }, {});
      equal(answers, 100, method + ' enumerates [0, length)');

      var growingCollection = [1, 2, 3], count = 0;
      _[method](growingCollection, function() {
        if (count < 10) growingCollection.push(count++);
        return method === 'every' ? true : null;
      }, {});
      equal(count, 3, method + ' is resistant to length changes');
    });

    _.each(collection.concat(object), function(method) {
      var changingObject = {0: 0, 1: 1}, count = 0;
      _[method](changingObject, function(val) {
        if (count < 10) changingObject[++count] = val + 1;
        return method === 'every' ? true : null;
      }, {});

      equal(count, 2, method + ' is resistant to property changes');
    });
  });

  test('map', function() {
    var doubled = _.map([1, 2, 3], function(num){ return num * 2; });
    deepEqual(doubled, [2, 4, 6], 'doubled numbers');

    var tripled = _.map([1, 2, 3], function(num){ return num * this.multiplier; }, {multiplier : 3});
    deepEqual(tripled, [3, 6, 9], 'tripled numbers with context');

    doubled = _([1, 2, 3]).map(function(num){ return num * 2; });
    deepEqual(doubled, [2, 4, 6], 'OO-style doubled numbers');

    var ids = _.map({length: 2, 0: {id: '1'}, 1: {id: '2'}}, function(n){
      return n.id;
    });
    deepEqual(ids, ['1', '2'], 'Can use collection methods on Array-likes.');

    deepEqual(_.map(null, _.noop), [], 'handles a null properly');

    deepEqual(_.map([1], function() {
      return this.length;
    }, [5]), [1], 'called with context');

    // Passing a property name like _.pluck.
    var people = [{name : 'moe', age : 30}, {name : 'curly', age : 50}];
    deepEqual(_.map(people, 'name'), ['moe', 'curly'], 'predicate string map to object properties');
  });

  test('collect', function() {
    strictEqual(_.map, _.collect, 'alias for map');
  });

  test('reduce', function() {
    var sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; }, 0);
    equal(sum, 6, 'can sum up an array');

    var context = {multiplier : 3};
    sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num * this.multiplier; }, 0, context);
    equal(sum, 18, 'can reduce with a context object');

    sum = _.inject([1, 2, 3], function(sum, num){ return sum + num; }, 0);
    equal(sum, 6, 'aliased as "inject"');

    sum = _([1, 2, 3]).reduce(function(sum, num){ return sum + num; }, 0);
    equal(sum, 6, 'OO-style reduce');

    sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; });
    equal(sum, 6, 'default initial value');

    var prod = _.reduce([1, 2, 3, 4], function(prod, num){ return prod * num; });
    equal(prod, 24, 'can reduce via multiplication');

    ok(_.reduce(null, _.noop, 138) === 138, 'handles a null (with initial value) properly');
    equal(_.reduce([], _.noop, undefined), undefined, 'undefined can be passed as a special case');
    equal(_.reduce([_], _.noop), _, 'collection of length one with no initial value returns the first item');
    equal(_.reduce([], _.noop), undefined, 'returns undefined when collection is empty and no initial value');
  });

  test('foldl', function() {
    strictEqual(_.reduce, _.foldl, 'alias for reduce');
  });

  test('reduceRight', function() {
    var list = _.reduceRight(['foo', 'bar', 'baz'], function(memo, str){ return memo + str; }, '');
    equal(list, 'bazbarfoo', 'can perform right folds');

    list = _.reduceRight(['foo', 'bar', 'baz'], function(memo, str){ return memo + str; });
    equal(list, 'bazbarfoo', 'default initial value');

    var sum = _.reduceRight({a: 1, b: 2, c: 3}, function(sum, num){ return sum + num; });
    equal(sum, 6, 'default initial value on object');

    ok(_.reduceRight(null, _.noop, 138) === 138, 'handles a null (with initial value) properly');
    equal(_.reduceRight([_], _.noop), _, 'collection of length one with no initial value returns the first item');

    equal(_.reduceRight([], _.noop, undefined), undefined, 'undefined can be passed as a special case');
    equal(_.reduceRight([], _.noop), undefined, 'returns undefined when collection is empty and no initial value');

    // Assert that the correct arguments are being passed.

    var args,
        memo = {},
        object = {a: 1, b: 2},
        lastKey = _.keys(object).pop();

    var expected = lastKey === 'a'
      ? [memo, 1, 'a', object]
      : [memo, 2, 'b', object];

    _.reduceRight(object, function() {
      if (!args) args = _.toArray(arguments);
    }, memo);

    deepEqual(args, expected);

    // And again, with numeric keys.

    object = {'2': 'a', '1': 'b'};
    lastKey = _.keys(object).pop();
    args = null;

    expected = lastKey === '2'
      ? [memo, 'a', '2', object]
      : [memo, 'b', '1', object];

    _.reduceRight(object, function() {
      if (!args) args = _.toArray(arguments);
    }, memo);

    deepEqual(args, expected);
  });

  test('foldr', function() {
    strictEqual(_.reduceRight, _.foldr, 'alias for reduceRight');
  });

  test('find', function() {
    var array = [1, 2, 3, 4];
    strictEqual(_.find(array, function(n) { return n > 2; }), 3, 'should return first found `value`');
    strictEqual(_.find(array, function() { return false; }), void 0, 'should return `undefined` if `value` is not found');

    array.dontmatch = 55;
    strictEqual(_.find(array, function(x) { return x === 55; }), void 0, 'iterates array-likes correctly');

    // Matching an object like _.findWhere.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
    deepEqual(_.find(list, {a: 1}), {a: 1, b: 2}, 'can be used as findWhere');
    deepEqual(_.find(list, {b: 4}), {a: 1, b: 4});
    ok(!_.find(list, {c: 1}), 'undefined when not found');
    ok(!_.find([], {c: 1}), 'undefined when searching empty list');

    var result = _.find([1, 2, 3], function(num){ return num * 2 === 4; });
    equal(result, 2, 'found the first "2" and broke the loop');

    var obj = {
      a: {x: 1, z: 3},
      b: {x: 2, z: 2},
      c: {x: 3, z: 4},
      d: {x: 4, z: 1}
    };

    deepEqual(_.find(obj, {x: 2}), {x: 2, z: 2}, 'works on objects');
    deepEqual(_.find(obj, {x: 2, z: 1}), void 0);
    deepEqual(_.find(obj, function(x) {
      return x.x === 4;
    }), {x: 4, z: 1});

    _.findIndex([{a: 1}], function(a, key, obj) {
      equal(key, 0);
      deepEqual(obj, [{a: 1}]);
      strictEqual(this, _, 'called with context');
    }, _);
  });

  test('detect', function() {
    strictEqual(_.detect, _.find, 'alias for detect');
  });

  test('filter', function() {
    var evenArray = [1, 2, 3, 4, 5, 6];
    var evenObject = {one: 1, two: 2, three: 3};
    var isEven = function(num){ return num % 2 === 0; };

    deepEqual(_.filter(evenArray, isEven), [2, 4, 6]);
    deepEqual(_.filter(evenObject, isEven), [2], 'can filter objects');
    deepEqual(_.filter([{}, evenObject, []], 'two'), [evenObject], 'predicate string map to object properties');

    _.filter([1], function() {
      equal(this, evenObject, 'given context');
    }, evenObject);

    // Can be used like _.where.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    deepEqual(_.filter(list, {a: 1}), [{a: 1, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}]);
    deepEqual(_.filter(list, {b: 2}), [{a: 1, b: 2}, {a: 2, b: 2}]);
    deepEqual(_.filter(list, {}), list, 'Empty object accepts all items');
    deepEqual(_(list).filter({}), list, 'OO-filter');
  });

  test('select', function() {
    strictEqual(_.filter, _.select, 'alias for filter');
  });

  test('reject', function() {
    var odds = _.reject([1, 2, 3, 4, 5, 6], function(num){ return num % 2 === 0; });
    deepEqual(odds, [1, 3, 5], 'rejected each even number');

    var context = 'obj';

    var evens = _.reject([1, 2, 3, 4, 5, 6], function(num){
      equal(context, 'obj');
      return num % 2 !== 0;
    }, context);
    deepEqual(evens, [2, 4, 6], 'rejected each odd number');

    deepEqual(_.reject([odds, {one: 1, two: 2, three: 3}], 'two'), [odds], 'predicate string map to object properties');

    // Can be used like _.where.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    deepEqual(_.reject(list, {a: 1}), [{a: 2, b: 2}]);
    deepEqual(_.reject(list, {b: 2}), [{a: 1, b: 3}, {a: 1, b: 4}]);
    deepEqual(_.reject(list, {}), [], 'Returns empty list given empty object');
    deepEqual(_.reject(list, []), [], 'Returns empty list given empty array');
  });

  test('every', function() {
    ok(_.every([], _.identity), 'the empty set');
    ok(_.every([true, true, true], _.identity), 'every true values');
    ok(!_.every([true, false, true], _.identity), 'one false value');
    ok(_.every([0, 10, 28], function(num){ return num % 2 === 0; }), 'even numbers');
    ok(!_.every([0, 11, 28], function(num){ return num % 2 === 0; }), 'an odd number');
    ok(_.every([1], _.identity) === true, 'cast to boolean - true');
    ok(_.every([0], _.identity) === false, 'cast to boolean - false');
    ok(!_.every([undefined, undefined, undefined], _.identity), 'works with arrays of undefined');

    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    ok(!_.every(list, {a: 1, b: 2}), 'Can be called with object');
    ok(_.every(list, 'a'), 'String mapped to object property');

    list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
    ok(_.every(list, {b: 2}), 'Can be called with object');
    ok(!_.every(list, 'c'), 'String mapped to object property');

    ok(_.every({a: 1, b: 2, c: 3, d: 4}, _.isNumber), 'takes objects');
    ok(!_.every({a: 1, b: 2, c: 3, d: 4}, _.isObject), 'takes objects');
    ok(_.every(['a', 'b', 'c', 'd'], _.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
    ok(!_.every(['a', 'b', 'c', 'd', 'f'], _.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
  });

  test('all', function() {
    strictEqual(_.all, _.every, 'alias for all');
  });

  test('some', function() {
    ok(!_.some([]), 'the empty set');
    ok(!_.some([false, false, false]), 'all false values');
    ok(_.some([false, false, true]), 'one true value');
    ok(_.some([null, 0, 'yes', false]), 'a string');
    ok(!_.some([null, 0, '', false]), 'falsy values');
    ok(!_.some([1, 11, 29], function(num){ return num % 2 === 0; }), 'all odd numbers');
    ok(_.some([1, 10, 29], function(num){ return num % 2 === 0; }), 'an even number');
    ok(_.some([1], _.identity) === true, 'cast to boolean - true');
    ok(_.some([0], _.identity) === false, 'cast to boolean - false');
    ok(_.some([false, false, true]));

    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    ok(!_.some(list, {a: 5, b: 2}), 'Can be called with object');
    ok(_.some(list, 'a'), 'String mapped to object property');

    list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
    ok(_.some(list, {b: 2}), 'Can be called with object');
    ok(!_.some(list, 'd'), 'String mapped to object property');

    ok(_.some({a: '1', b: '2', c: '3', d: '4', e: 6}, _.isNumber), 'takes objects');
    ok(!_.some({a: 1, b: 2, c: 3, d: 4}, _.isObject), 'takes objects');
    ok(_.some(['a', 'b', 'c', 'd'], _.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
    ok(!_.some(['x', 'y', 'z'], _.hasOwnProperty, {a: 1, b: 2, c: 3, d: 4}), 'context works');
  });

  test('any', function() {
    strictEqual(_.any, _.some, 'alias for any');
  });

  test('includes', function() {
    _.each([null, void 0, 0, 1, NaN, {}, []], function(val) {
      strictEqual(_.includes(val, 'hasOwnProperty'), false);
    });
    strictEqual(_.includes([1, 2, 3], 2), true, 'two is in the array');
    ok(!_.includes([1, 3, 9], 2), 'two is not in the array');

    strictEqual(_.includes([5, 4, 3, 2, 1], 5, true), true, 'doesn\'t delegate to binary search');

    ok(_.includes({moe: 1, larry: 3, curly: 9}, 3) === true, '_.includes on objects checks their values');
    ok(_([1, 2, 3]).includes(2), 'OO-style includes');
  });

  test('include', function() {
    strictEqual(_.includes, _.include, 'alias for includes');
  });

  test('contains', function() {
    strictEqual(_.includes, _.contains, 'alias for includes');

    var numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    strictEqual(_.includes(numbers, 1, 1), true, 'contains takes a fromIndex');
    strictEqual(_.includes(numbers, 1, -1), false, 'contains takes a fromIndex');
    strictEqual(_.includes(numbers, 1, -2), false, 'contains takes a fromIndex');
    strictEqual(_.includes(numbers, 1, -3), true, 'contains takes a fromIndex');
    strictEqual(_.includes(numbers, 1, 6), true, 'contains takes a fromIndex');
    strictEqual(_.includes(numbers, 1, 7), false, 'contains takes a fromIndex');

    ok(_.every([1, 2, 3], _.partial(_.contains, numbers)), 'fromIndex is guarded');
  });

  test('includes with NaN', function() {
    strictEqual(_.includes([1, 2, NaN, NaN], NaN), true, 'Expected [1, 2, NaN] to contain NaN');
    strictEqual(_.includes([1, 2, Infinity], NaN), false, 'Expected [1, 2, NaN] to contain NaN');
  });

  test('includes with +- 0', function() {
    _.each([-0, +0], function(val) {
      strictEqual(_.includes([1, 2, val, val], val), true);
      strictEqual(_.includes([1, 2, val, val], -val), true);
      strictEqual(_.includes([-1, 1, 2], -val), false);
    });
  });


  test('invoke', 5, function() {
    var list = [[5, 1, 7], [3, 2, 1]];
    var result = _.invoke(list, 'sort');
    deepEqual(result[0], [1, 5, 7], 'first array sorted');
    deepEqual(result[1], [1, 2, 3], 'second array sorted');

    _.invoke([{
      method: function() {
        deepEqual(_.toArray(arguments), [1, 2, 3], 'called with arguments');
      }
    }], 'method', 1, 2, 3);

    deepEqual(_.invoke([{a: null}, {}, {a: _.constant(1)}], 'a'), [null, void 0, 1], 'handles null & undefined');

    throws(function() {
      _.invoke([{a: 1}], 'a');
    }, TypeError, 'throws for non-functions');
  });

  test('invoke w/ function reference', function() {
    var list = [[5, 1, 7], [3, 2, 1]];
    var result = _.invoke(list, Array.prototype.sort);
    deepEqual(result[0], [1, 5, 7], 'first array sorted');
    deepEqual(result[1], [1, 2, 3], 'second array sorted');

    deepEqual(_.invoke([1, 2, 3], function(a) {
      return a + this;
    }, 5), [6, 7, 8], 'receives params from invoke');
  });

  // Relevant when using ClojureScript
  test('invoke when strings have a call method', function() {
    String.prototype.call = function() {
      return 42;
    };
    var list = [[5, 1, 7], [3, 2, 1]];
    var s = 'foo';
    equal(s.call(), 42, 'call function exists');
    var result = _.invoke(list, 'sort');
    deepEqual(result[0], [1, 5, 7], 'first array sorted');
    deepEqual(result[1], [1, 2, 3], 'second array sorted');
    delete String.prototype.call;
    equal(s.call, undefined, 'call function removed');
  });

  test('pluck', function() {
    var people = [{name: 'moe', age: 30}, {name: 'curly', age: 50}];
    deepEqual(_.pluck(people, 'name'), ['moe', 'curly'], 'pulls names out of objects');
    deepEqual(_.pluck(people, 'address'), [undefined, undefined], 'missing properties are returned as undefined');
    //compat: most flexible handling of edge cases
    deepEqual(_.pluck([{'[object Object]': 1}], {}), [1]);
  });

  test('where', function() {
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    var result = _.where(list, {a: 1});
    equal(result.length, 3);
    equal(result[result.length - 1].b, 4);
    result = _.where(list, {b: 2});
    equal(result.length, 2);
    equal(result[0].a, 1);
    result = _.where(list, {});
    equal(result.length, list.length);

    function test() {}
    test.map = _.map;
    deepEqual(_.where([_, {a: 1, b: 2}, _], test), [_, _], 'checks properties given function');
  });

  test('findWhere', function() {
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
    var result = _.findWhere(list, {a: 1});
    deepEqual(result, {a: 1, b: 2});
    result = _.findWhere(list, {b: 4});
    deepEqual(result, {a: 1, b: 4});

    result = _.findWhere(list, {c: 1});
    ok(_.isUndefined(result), 'undefined when not found');

    result = _.findWhere([], {c: 1});
    ok(_.isUndefined(result), 'undefined when searching empty list');

    function test() {}
    test.map = _.map;
    equal(_.findWhere([_, {a: 1, b: 2}, _], test), _, 'checks properties given function');

    function TestClass() {
      this.y = 5;
      this.x = 'foo';
    }
    var expect = {c: 1, x: 'foo', y: 5};
    deepEqual(_.findWhere([{y: 5, b: 6}, expect], new TestClass()), expect, 'uses class instance properties');
  });

  test('max', function() {
    equal(-Infinity, _.max(null), 'can handle null/undefined');
    equal(-Infinity, _.max(undefined), 'can handle null/undefined');
    equal(-Infinity, _.max(null, _.identity), 'can handle null/undefined');

    equal(3, _.max([1, 2, 3]), 'can perform a regular Math.max');

    var neg = _.max([1, 2, 3], function(num){ return -num; });
    equal(neg, 1, 'can perform a computation-based max');

    equal(-Infinity, _.max({}), 'Maximum value of an empty object');
    equal(-Infinity, _.max([]), 'Maximum value of an empty array');
    equal(_.max({'a': 'a'}), -Infinity, 'Maximum value of a non-numeric collection');

    equal(299999, _.max(_.range(1, 300000)), 'Maximum value of a too-big array');

    equal(3, _.max([1, 2, 3, 'test']), 'Finds correct max in array starting with num and containing a NaN');
    equal(3, _.max(['test', 1, 2, 3]), 'Finds correct max in array starting with NaN');

    var a = {x: -Infinity};
    var b = {x: -Infinity};
    var iterator = function(o){ return o.x; };
    equal(_.max([a, b], iterator), a, 'Respects iterator return value of -Infinity');

    deepEqual(_.max([{'a': 1}, {'a': 0, 'b': 3}, {'a': 4}, {'a': 2}], 'a'), {'a': 4}, 'String keys use property iterator');

    deepEqual(_.max([0, 2], function(a){ return a * this.x; }, {x: 1}), 2, 'Iterator context');
    deepEqual(_.max([[1], [2, 3], [-1, 4], [5]], 0), [5], 'Lookup falsy iterator');
    deepEqual(_.max([{0: 1}, {0: 2}, {0: -1}, {a: 1}], 0), {0: 2}, 'Lookup falsy iterator');
  });

  test('min', function() {
    equal(Infinity, _.min(null), 'can handle null/undefined');
    equal(Infinity, _.min(undefined), 'can handle null/undefined');
    equal(Infinity, _.min(null, _.identity), 'can handle null/undefined');

    equal(1, _.min([1, 2, 3]), 'can perform a regular Math.min');

    var neg = _.min([1, 2, 3], function(num){ return -num; });
    equal(neg, 3, 'can perform a computation-based min');

    equal(Infinity, _.min({}), 'Minimum value of an empty object');
    equal(Infinity, _.min([]), 'Minimum value of an empty array');
    equal(_.min({'a': 'a'}), Infinity, 'Minimum value of a non-numeric collection');

    var now = new Date(9999999999);
    var then = new Date(0);
    equal(_.min([now, then]), then);

    equal(1, _.min(_.range(1, 300000)), 'Minimum value of a too-big array');

    equal(1, _.min([1, 2, 3, 'test']), 'Finds correct min in array starting with num and containing a NaN');
    equal(1, _.min(['test', 1, 2, 3]), 'Finds correct min in array starting with NaN');

    var a = {x: Infinity};
    var b = {x: Infinity};
    var iterator = function(o){ return o.x; };
    equal(_.min([a, b], iterator), a, 'Respects iterator return value of Infinity');

    deepEqual(_.min([{'a': 1}, {'a': 0, 'b': 3}, {'a': 4}, {'a': 2}], 'a'), {'a': 0, 'b': 3}, 'String keys use property iterator');

    deepEqual(_.min([0, 2], function(a){ return a * this.x; }, {x: -1}), 2, 'Iterator context');
    deepEqual(_.min([[1], [2, 3], [-1, 4], [5]], 0), [-1, 4], 'Lookup falsy iterator');
    deepEqual(_.min([{0: 1}, {0: 2}, {0: -1}, {a: 1}], 0), {0: -1}, 'Lookup falsy iterator');
  });

  test('sortBy', function() {
    var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
    people = _.sortBy(people, function(person){ return person.age; });
    deepEqual(_.pluck(people, 'name'), ['moe', 'curly'], 'stooges sorted by age');

    var list = [undefined, 4, 1, undefined, 3, 2];
    deepEqual(_.sortBy(list, _.identity), [1, 2, 3, 4, undefined, undefined], 'sortBy with undefined values');

    list = ['one', 'two', 'three', 'four', 'five'];
    var sorted = _.sortBy(list, 'length');
    deepEqual(sorted, ['one', 'two', 'four', 'five', 'three'], 'sorted by length');

    function Pair(x, y) {
      this.x = x;
      this.y = y;
    }

    var collection = [
      new Pair(1, 1), new Pair(1, 2),
      new Pair(1, 3), new Pair(1, 4),
      new Pair(1, 5), new Pair(1, 6),
      new Pair(2, 1), new Pair(2, 2),
      new Pair(2, 3), new Pair(2, 4),
      new Pair(2, 5), new Pair(2, 6),
      new Pair(undefined, 1), new Pair(undefined, 2),
      new Pair(undefined, 3), new Pair(undefined, 4),
      new Pair(undefined, 5), new Pair(undefined, 6)
    ];

    var actual = _.sortBy(collection, function(pair) {
      return pair.x;
    });

    deepEqual(actual, collection, 'sortBy should be stable');

    deepEqual(_.sortBy(collection, 'x'), collection, 'sortBy accepts property string');

    list = ['q', 'w', 'e', 'r', 't', 'y'];
    deepEqual(_.sortBy(list), ['e', 'q', 'r', 't', 'w', 'y'], 'uses _.identity if iterator is not specified');
  });

  test('groupBy', function() {
    var parity = _.groupBy([1, 2, 3, 4, 5, 6], function(num){ return num % 2; });
    ok('0' in parity && '1' in parity, 'created a group for each value');
    deepEqual(parity[0], [2, 4, 6], 'put each even number in the right group');

    var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    var grouped = _.groupBy(list, 'length');
    deepEqual(grouped['3'], ['one', 'two', 'six', 'ten']);
    deepEqual(grouped['4'], ['four', 'five', 'nine']);
    deepEqual(grouped['5'], ['three', 'seven', 'eight']);

    var context = {};
    _.groupBy([{}], function(){ ok(this === context); }, context);

    grouped = _.groupBy([4.2, 6.1, 6.4], function(num) {
      return Math.floor(num) > 4 ? 'hasOwnProperty' : 'constructor';
    });
    equal(grouped.constructor.length, 1);
    equal(grouped.hasOwnProperty.length, 2);

    var array = [{}];
    _.groupBy(array, function(value, index, obj){ ok(obj === array); });

    array = [1, 2, 1, 2, 3];
    grouped = _.groupBy(array);
    equal(grouped['1'].length, 2);
    equal(grouped['3'].length, 1);

    var matrix = [
      [1, 2],
      [1, 3],
      [2, 3]
    ];
    deepEqual(_.groupBy(matrix, 0), {1: [[1, 2], [1, 3]], 2: [[2, 3]]});
    deepEqual(_.groupBy(matrix, 1), {2: [[1, 2]], 3: [[1, 3], [2, 3]]});
  });

  test('indexBy', function() {
    var parity = _.indexBy([1, 2, 3, 4, 5], function(num){ return num % 2 === 0; });
    equal(parity['true'], 4);
    equal(parity['false'], 5);

    var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    var grouped = _.indexBy(list, 'length');
    equal(grouped['3'], 'ten');
    equal(grouped['4'], 'nine');
    equal(grouped['5'], 'eight');

    var array = [1, 2, 1, 2, 3];
    grouped = _.indexBy(array);
    equal(grouped['1'], 1);
    equal(grouped['2'], 2);
    equal(grouped['3'], 3);
  });

  test('countBy', function() {
    var parity = _.countBy([1, 2, 3, 4, 5], function(num){ return num % 2 === 0; });
    equal(parity['true'], 2);
    equal(parity['false'], 3);

    var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    var grouped = _.countBy(list, 'length');
    equal(grouped['3'], 4);
    equal(grouped['4'], 3);
    equal(grouped['5'], 3);

    var context = {};
    _.countBy([{}], function(){ ok(this === context); }, context);

    grouped = _.countBy([4.2, 6.1, 6.4], function(num) {
      return Math.floor(num) > 4 ? 'hasOwnProperty' : 'constructor';
    });
    equal(grouped.constructor, 1);
    equal(grouped.hasOwnProperty, 2);

    var array = [{}];
    _.countBy(array, function(value, index, obj){ ok(obj === array); });

    array = [1, 2, 1, 2, 3];
    grouped = _.countBy(array);
    equal(grouped['1'], 2);
    equal(grouped['3'], 1);
  });

  test('shuffle', function() {
    var numbers = _.range(10);
    var shuffled = _.shuffle(numbers);
    notStrictEqual(numbers, shuffled, 'original object is unmodified');
    ok(_.every(_.range(10), function() { //appears consistent?
      return _.every(numbers, _.partial(_.contains, numbers));
    }), 'contains the same members before and after shuffle');

    shuffled = _.shuffle({a: 1, b: 2, c: 3, d: 4});
    equal(shuffled.length, 4);
    deepEqual(shuffled.sort(), [1, 2, 3, 4], 'works on objects');
  });

  test('sample', function() {
    var numbers = _.range(10);
    var allSampled = _.sample(numbers, 10).sort();
    deepEqual(allSampled, numbers, 'contains the same members before and after sample');
    allSampled = _.sample(numbers, 20).sort();
    deepEqual(allSampled, numbers, 'also works when sampling more objects than are present');
    ok(_.contains(numbers, _.sample(numbers)), 'sampling a single element returns something from the array');
    strictEqual(_.sample([]), undefined, 'sampling empty array with no number returns undefined');
    notStrictEqual(_.sample([], 5), [], 'sampling empty array with a number returns an empty array');
    notStrictEqual(_.sample([1, 2, 3], 0), [], 'sampling an array with 0 picks returns an empty array');
    deepEqual(_.sample([1, 2], -1), [], 'sampling a negative number of picks returns an empty array');
    ok(_.contains([1, 2, 3], _.sample({a: 1, b: 2, c: 3})), 'sample one value from an object');
  });

  test('toArray', function() {
    ok(!_.isArray(arguments), 'arguments object is not an array');
    ok(_.isArray(_.toArray(arguments)), 'arguments object converted into array');
    var a = [1, 2, 3];
    ok(_.toArray(a) !== a, 'array is cloned');
    deepEqual(_.toArray(a), [1, 2, 3], 'cloned array contains same elements');

    var numbers = _.toArray({one : 1, two : 2, three : 3});
    deepEqual(numbers, [1, 2, 3], 'object flattened into array');

    if (typeof document != 'undefined') {
      // test in IE < 9
      var actual;
      try {
        actual = _.toArray(document.childNodes);
      } catch(ex) { }
      deepEqual(actual, _.map(document.childNodes, _.identity), 'works on NodeList');
    }
  });

  test('size', function() {
    equal(_.size({one : 1, two : 2, three : 3}), 3, 'can compute the size of an object');
    equal(_.size([1, 2, 3]), 3, 'can compute the size of an array');
    equal(_.size({length: 3, 0: 0, 1: 0, 2: 0}), 3, 'can compute the size of Array-likes');

    var func = function() {
      return _.size(arguments);
    };

    equal(func(1, 2, 3, 4), 4, 'can test the size of the arguments object');

    equal(_.size('hello'), 5, 'can compute the size of a string literal');
    equal(_.size(new String('hello')), 5, 'can compute the size of string object');

    equal(_.size(null), 0, 'handles nulls');
    equal(_.size(0), 0, 'handles numbers');
  });

  test('partition', function() {
    var list = [0, 1, 2, 3, 4, 5];
    deepEqual(_.partition(list, function(x) { return x < 4; }), [[0, 1, 2, 3], [4, 5]], 'handles bool return values');
    deepEqual(_.partition(list, function(x) { return x & 1; }), [[1, 3, 5], [0, 2, 4]], 'handles 0 and 1 return values');
    deepEqual(_.partition(list, function(x) { return x - 3; }), [[0, 1, 2, 4, 5], [3]], 'handles other numeric return values');
    deepEqual(_.partition(list, function(x) { return x > 1 ? null : true; }), [[0, 1], [2, 3, 4, 5]], 'handles null return values');
    deepEqual(_.partition(list, function(x) { if (x < 2) return true; }), [[0, 1], [2, 3, 4, 5]], 'handles undefined return values');
    deepEqual(_.partition({a: 1, b: 2, c: 3}, function(x) { return x > 1; }), [[2, 3], [1]], 'handles objects');

    deepEqual(_.partition(list, function(x, index) { return index % 2; }), [[1, 3, 5], [0, 2, 4]], 'can reference the array index');
    deepEqual(_.partition(list, function(x, index, arr) { return x === arr.length - 1; }), [[5], [0, 1, 2, 3, 4]], 'can reference the collection');

    // Default iterator
    deepEqual(_.partition([1, false, true, '']), [[1, true], [false, '']], 'Default iterator');
    deepEqual(_.partition([{x: 1}, {x: 0}, {x: 1}], 'x'), [[{x: 1}, {x: 1}], [{x: 0}]], 'Takes a string');

    // Context
    var predicate = function(x){ return x === this.x; };
    deepEqual(_.partition([1, 2, 3], predicate, {x: 2}), [[2], [1, 3]], 'partition takes a context argument');

    deepEqual(_.partition([{a: 1}, {b: 2}, {a: 1, b: 2}], {a: 1}), [[{a: 1}, {a: 1, b: 2}], [{b: 2}]], 'predicate can be object');

    var object = {a: 1};
    _.partition(object, function(val, key, obj) {
      equal(val, 1);
      equal(key, 'a');
      equal(obj, object);
      equal(this, predicate);
    }, predicate);
  });

  if (typeof document != 'undefined') {
    test('Can use various collection methods on NodeLists', function() {
        var parent = document.createElement('div');
        parent.innerHTML = '<span id=id1></span>textnode<span id=id2></span>';

        var elementChildren = _.filter(parent.childNodes, _.isElement);
        equal(elementChildren.length, 2);

        deepEqual(_.map(elementChildren, 'id'), ['id1', 'id2']);
        deepEqual(_.map(parent.childNodes, 'nodeType'), [1, 3, 1]);

        ok(!_.every(parent.childNodes, _.isElement));
        ok(_.some(parent.childNodes, _.isElement));

        function compareNode(node) {
          return _.isElement(node) ? node.id.charAt(2) : void 0;
        }
        equal(_.max(parent.childNodes, compareNode), _.last(parent.childNodes));
        equal(_.min(parent.childNodes, compareNode), _.first(parent.childNodes));
    });
  }

}());


(function() {
  if (typeof document == 'undefined') return;

  var _ = typeof require == 'function' ? require('..') : this._;

  QUnit.module('Cross Document');
  /* global iObject, iElement, iArguments, iFunction, iArray, iError, iString, iNumber, iBoolean, iDate, iRegExp, iNaN, iNull, iUndefined, ActiveXObject */

  // Setup remote variables for iFrame tests.
  var iframe = document.createElement('iframe');
  iframe.frameBorder = iframe.height = iframe.width = 0;
  document.body.appendChild(iframe);
  var iDoc = (iDoc = iframe.contentDocument || iframe.contentWindow).document || iDoc;
  iDoc.write(
    [
      '<script>',
      'parent.iElement = document.createElement("div");',
      'parent.iArguments = (function(){ return arguments; })(1, 2, 3);',
      'parent.iArray = [1, 2, 3];',
      'parent.iString = new String("hello");',
      'parent.iNumber = new Number(100);',
      'parent.iFunction = (function(){});',
      'parent.iDate = new Date();',
      'parent.iRegExp = /hi/;',
      'parent.iNaN = NaN;',
      'parent.iNull = null;',
      'parent.iBoolean = new Boolean(false);',
      'parent.iUndefined = undefined;',
      'parent.iObject = {};',
      'parent.iError = new Error();',
      '</script>'
    ].join('\n')
  );
  iDoc.close();

  test('isEqual', function() {

    ok(!_.isEqual(iNumber, 101));
    ok(_.isEqual(iNumber, 100));

    // Objects from another frame.
    ok(_.isEqual({}, iObject), 'Objects with equivalent members created in different documents are equal');

    // Array from another frame.
    ok(_.isEqual([1, 2, 3], iArray), 'Arrays with equivalent elements created in different documents are equal');
  });

  test('isEmpty', function() {
    ok(!_([iNumber]).isEmpty(), '[1] is not empty');
    ok(!_.isEmpty(iArray), '[] is empty');
    ok(_.isEmpty(iObject), '{} is empty');
  });

  test('isElement', function() {
    ok(!_.isElement('div'), 'strings are not dom elements');
    ok(_.isElement(document.body), 'the body tag is a DOM element');
    ok(_.isElement(iElement), 'even from another frame');
  });

  test('isArguments', function() {
    ok(_.isArguments(iArguments), 'even from another frame');
  });

  test('isObject', function() {
    ok(_.isObject(iElement), 'even from another frame');
    ok(_.isObject(iFunction), 'even from another frame');
  });

  test('isArray', function() {
    ok(_.isArray(iArray), 'even from another frame');
  });

  test('isString', function() {
    ok(_.isString(iString), 'even from another frame');
  });

  test('isNumber', function() {
    ok(_.isNumber(iNumber), 'even from another frame');
  });

  test('isBoolean', function() {
    ok(_.isBoolean(iBoolean), 'even from another frame');
  });

  test('isFunction', function() {
    ok(_.isFunction(iFunction), 'even from another frame');
  });

  test('isDate', function() {
    ok(_.isDate(iDate), 'even from another frame');
  });

  test('isRegExp', function() {
    ok(_.isRegExp(iRegExp), 'even from another frame');
  });

  test('isNaN', function() {
    ok(_.isNaN(iNaN), 'even from another frame');
  });

  test('isNull', function() {
    ok(_.isNull(iNull), 'even from another frame');
  });

  test('isUndefined', function() {
    ok(_.isUndefined(iUndefined), 'even from another frame');
  });

  test('isError', function() {
    ok(_.isError(iError), 'even from another frame');
  });

  if (typeof ActiveXObject != 'undefined') {
    test('IE host objects', function() {
      var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
      ok(!_.isNumber(xml));
      ok(!_.isBoolean(xml));
      ok(!_.isNaN(xml));
      ok(!_.isFunction(xml));
      ok(!_.isNull(xml));
      ok(!_.isUndefined(xml));
    });

    test('#1621 IE 11 compat mode DOM elements are not functions', function() {
      var fn = function() {};
      var xml = new ActiveXObject('Msxml2.DOMDocument.3.0');
      var div = document.createElement('div');

      // JIT the function
      var count = 200;
      while (count--) {
        _.isFunction(fn);
      }

      equal(_.isFunction(xml), false);
      equal(_.isFunction(div), false);
      equal(_.isFunction(fn), true);
    });
  }

}());



(function() {
  var _ = typeof require == 'function' ? require('..') : this._;

  QUnit.module('Functions');
  QUnit.config.asyncRetries = 3;

  test('bind', function() {
    var context = {name : 'moe'};
    var func = function(arg) { return 'name: ' + (this.name || arg); };
    var bound = _.bind(func, context);
    equal(bound(), 'name: moe', 'can bind a function to a context');

    bound = _(func).bind(context);
    equal(bound(), 'name: moe', 'can do OO-style binding');

    bound = _.bind(func, null, 'curly');
    var result = bound();
    // Work around a PhantomJS bug when applying a function with null|undefined.
    ok(result === 'name: curly' || result === 'name: ' + window.name, 'can bind without specifying a context');

    func = function(salutation, name) { return salutation + ': ' + name; };
    func = _.bind(func, this, 'hello');
    equal(func('moe'), 'hello: moe', 'the function was partially applied in advance');

    func = _.bind(func, this, 'curly');
    equal(func(), 'hello: curly', 'the function was completely applied in advance');

    func = function(salutation, firstname, lastname) { return salutation + ': ' + firstname + ' ' + lastname; };
    func = _.bind(func, this, 'hello', 'moe', 'curly');
    equal(func(), 'hello: moe curly', 'the function was partially applied in advance and can accept multiple arguments');

    func = function(context, message) { equal(this, context, message); };
    _.bind(func, 0, 0, 'can bind a function to `0`')();
    _.bind(func, '', '', 'can bind a function to an empty string')();
    _.bind(func, false, false, 'can bind a function to `false`')();

    // These tests are only meaningful when using a browser without a native bind function
    // To test this with a modern browser, set underscore's nativeBind to undefined
    var F = function () { return this; };
    var boundf = _.bind(F, {hello: 'moe curly'});
    var Boundf = boundf; // make eslint happy.
    var newBoundf = new Boundf();
    equal(newBoundf.hello, undefined, 'function should not be bound to the context, to comply with ECMAScript 5');
    equal(boundf().hello, 'moe curly', "When called without the new operator, it's OK to be bound to the context");
    ok(newBoundf instanceof F, 'a bound instance is an instance of the original function');

    throws(function() { _.bind('notafunction'); }, TypeError, 'throws an error when binding to a non-function');
  });

  test('partial', function() {
    var obj = {name: 'moe'};
    var func = function() { return this.name + ' ' + _.toArray(arguments).join(' '); };

    obj.func = _.partial(func, 'a', 'b');
    equal(obj.func('c', 'd'), 'moe a b c d', 'can partially apply');

    obj.func = _.partial(func, _, 'b', _, 'd');
    equal(obj.func('a', 'c'), 'moe a b c d', 'can partially apply with placeholders');

    func = _.partial(function() { return arguments.length; }, _, 'b', _, 'd');
    equal(func('a', 'c', 'e'), 5, 'accepts more arguments than the number of placeholders');
    equal(func('a'), 4, 'accepts fewer arguments than the number of placeholders');

    func = _.partial(function() { return typeof arguments[2]; }, _, 'b', _, 'd');
    equal(func('a'), 'undefined', 'unfilled placeholders are undefined');

    // passes context
    function MyWidget(name, options) {
      this.name = name;
      this.options = options;
    }
    MyWidget.prototype.get = function() {
      return this.name;
    };
    var MyWidgetWithCoolOpts = _.partial(MyWidget, _, {a: 1});
    var widget = new MyWidgetWithCoolOpts('foo');
    ok(widget instanceof MyWidget, 'Can partially bind a constructor');
    equal(widget.get(), 'foo', 'keeps prototype');
    deepEqual(widget.options, {a: 1});
  });

  test('bindAll', function() {
    var curly = {name : 'curly'}, moe = {
      name    : 'moe',
      getName : function() { return 'name: ' + this.name; },
      sayHi   : function() { return 'hi: ' + this.name; }
    };
    curly.getName = moe.getName;
    _.bindAll(moe, 'getName', 'sayHi');
    curly.sayHi = moe.sayHi;
    equal(curly.getName(), 'name: curly', 'unbound function is bound to current object');
    equal(curly.sayHi(), 'hi: moe', 'bound function is still bound to original object');

    curly = {name : 'curly'};
    moe = {
      name    : 'moe',
      getName : function() { return 'name: ' + this.name; },
      sayHi   : function() { return 'hi: ' + this.name; },
      sayLast : function() { return this.sayHi(_.last(arguments)); }
    };

    throws(function() { _.bindAll(moe); }, Error, 'throws an error for bindAll with no functions named');
    throws(function() { _.bindAll(moe, 'sayBye'); }, TypeError, 'throws an error for bindAll if the given key is undefined');
    throws(function() { _.bindAll(moe, 'name'); }, TypeError, 'throws an error for bindAll if the given key is not a function');

    _.bindAll(moe, 'sayHi', 'sayLast');
    curly.sayHi = moe.sayHi;
    equal(curly.sayHi(), 'hi: moe');

    var sayLast = moe.sayLast;
    equal(sayLast(1, 2, 3, 4, 5, 6, 7, 'Tom'), 'hi: moe', 'createCallback works with any number of arguments');
  });

  test('memoize', function() {
    var fib = function(n) {
      return n < 2 ? n : fib(n - 1) + fib(n - 2);
    };
    equal(fib(10), 55, 'a memoized version of fibonacci produces identical results');
    fib = _.memoize(fib); // Redefine `fib` for memoization
    equal(fib(10), 55, 'a memoized version of fibonacci produces identical results');

    var o = function(str) {
      return str;
    };
    var fastO = _.memoize(o);
    equal(o('toString'), 'toString', 'checks hasOwnProperty');
    equal(fastO('toString'), 'toString', 'checks hasOwnProperty');

    // Expose the cache.
    var upper = _.memoize(function(s) {
      return s.toUpperCase();
    });
    equal(upper('foo'), 'FOO');
    equal(upper('bar'), 'BAR');
    deepEqual(upper.cache, {foo: 'FOO', bar: 'BAR'});
    upper.cache = {foo: 'BAR', bar: 'FOO'};
    equal(upper('foo'), 'BAR');
    equal(upper('bar'), 'FOO');

    var hashed = _.memoize(function(key) {
      //https://github.com/jashkenas/underscore/pull/1679#discussion_r13736209
      ok(/[a-z]+/.test(key), 'hasher doesn\'t change keys');
      return key;
    }, function(key) {
      return key.toUpperCase();
    });
    hashed('yep');
    deepEqual(hashed.cache, {'YEP': 'yep'}, 'takes a hasher');

    // Test that the hash function can be used to swizzle the key.
    var objCacher = _.memoize(function(value, key) {
      return {key: key, value: value};
    }, function(value, key) {
      return key;
    });
    var myObj = objCacher('a', 'alpha');
    var myObjAlias = objCacher('b', 'alpha');
    notStrictEqual(myObj, undefined, 'object is created if second argument used as key');
    strictEqual(myObj, myObjAlias, 'object is cached if second argument used as key');
    strictEqual(myObj.value, 'a', 'object is not modified if second argument used as key');
  });

  
  asyncTest('delay', 2, function() {
    var delayed = false;
    _.delay(function(){ delayed = true; }, 100);
    setTimeout(function(){ ok(!delayed, "didn't delay the function quite yet"); }, 50);
    setTimeout(function(){ ok(delayed, 'delayed the function'); start(); }, 150);
  });
  

  asyncTest('defer', 1, function() {
    var deferred = false;
    _.defer(function(bool){ deferred = bool; }, true);
    _.delay(function(){ ok(deferred, 'deferred the function'); start(); }, 50);
  });

  asyncTest('throttle', 2, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 32);
    throttledIncr(); throttledIncr();

    equal(counter, 1, 'incr was called immediately');
    _.delay(function(){ equal(counter, 2, 'incr was throttled'); start(); }, 64);
  });

  asyncTest('throttle arguments', 2, function() {
    var value = 0;
    var update = function(val){ value = val; };
    var throttledUpdate = _.throttle(update, 32);
    throttledUpdate(1); throttledUpdate(2);
    _.delay(function(){ throttledUpdate(3); }, 64);
    equal(value, 1, 'updated to latest value');
    _.delay(function(){ equal(value, 3, 'updated to latest value'); start(); }, 96);
  });

  asyncTest('throttle once', 2, function() {
    var counter = 0;
    var incr = function(){ return ++counter; };
    var throttledIncr = _.throttle(incr, 32);
    var result = throttledIncr();
    _.delay(function(){
      equal(result, 1, 'throttled functions return their value');
      equal(counter, 1, 'incr was called once'); start();
    }, 64);
  });

  asyncTest('throttle twice', 1, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 32);
    throttledIncr(); throttledIncr();
    _.delay(function(){ equal(counter, 2, 'incr was called twice'); start(); }, 64);
  });

  asyncTest('more throttling', 3, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 30);
    throttledIncr(); throttledIncr();
    equal(counter, 1);
    _.delay(function(){
      equal(counter, 2);
      throttledIncr();
      equal(counter, 3);
      start();
    }, 85);
  });

  asyncTest('throttle repeatedly with results', 6, function() {
    var counter = 0;
    var incr = function(){ return ++counter; };
    var throttledIncr = _.throttle(incr, 100);
    var results = [];
    var saveResult = function() { results.push(throttledIncr()); };
    saveResult(); saveResult();
    _.delay(saveResult, 50);
    _.delay(saveResult, 150);
    _.delay(saveResult, 160);
    _.delay(saveResult, 230);
    _.delay(function() {
      equal(results[0], 1, 'incr was called once');
      equal(results[1], 1, 'incr was throttled');
      equal(results[2], 1, 'incr was throttled');
      equal(results[3], 2, 'incr was called twice');
      equal(results[4], 2, 'incr was throttled');
      equal(results[5], 3, 'incr was called trailing');
      start();
    }, 300);
  });

  asyncTest('throttle triggers trailing call when invoked repeatedly', 2, function() {
    var counter = 0;
    var limit = 48;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 32);

    var stamp = new Date;
    while (new Date - stamp < limit) {
      throttledIncr();
    }
    var lastCount = counter;
    ok(counter > 1);

    _.delay(function() {
      ok(counter > lastCount);
      start();
    }, 96);
  });

  asyncTest('throttle does not trigger leading call when leading is set to false', 2, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 60, {leading: false});

    throttledIncr(); throttledIncr();
    equal(counter, 0);

    _.delay(function() {
      equal(counter, 1);
      start();
    }, 96);
  });

  asyncTest('more throttle does not trigger leading call when leading is set to false', 3, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 100, {leading: false});

    throttledIncr();
    _.delay(throttledIncr, 50);
    _.delay(throttledIncr, 60);
    _.delay(throttledIncr, 200);
    equal(counter, 0);

    _.delay(function() {
      equal(counter, 1);
    }, 250);

    _.delay(function() {
      equal(counter, 2);
      start();
    }, 350);
  });

  asyncTest('one more throttle with leading: false test', 2, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 100, {leading: false});

    var time = new Date;
    while (new Date - time < 350) throttledIncr();
    ok(counter <= 3);

    _.delay(function() {
      ok(counter <= 4);
      start();
    }, 200);
  });

  asyncTest('throttle does not trigger trailing call when trailing is set to false', 4, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 60, {trailing: false});

    throttledIncr(); throttledIncr(); throttledIncr();
    equal(counter, 1);

    _.delay(function() {
      equal(counter, 1);

      throttledIncr(); throttledIncr();
      equal(counter, 2);

      _.delay(function() {
        equal(counter, 2);
        start();
      }, 96);
    }, 96);
  });

  asyncTest('throttle continues to function after system time is set backwards', 2, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 100);
    var origNowFunc = _.now;

    throttledIncr();
    equal(counter, 1);
    _.now = function () {
      return new Date(2013, 0, 1, 1, 1, 1);
    };

    _.delay(function() {
      throttledIncr();
      equal(counter, 2);
      start();
      _.now = origNowFunc;
    }, 200);
  });

  asyncTest('throttle re-entrant', 2, function() {
    var sequence = [
      ['b1', 'b2'],
      ['c1', 'c2']
    ];
    var value = '';
    var throttledAppend;
    var append = function(arg){
      value += this + arg;
      var args = sequence.pop();
      if (args) {
        throttledAppend.call(args[0], args[1]);
      }
    };
    throttledAppend = _.throttle(append, 32);
    throttledAppend.call('a1', 'a2');
    equal(value, 'a1a2');
    _.delay(function(){
      equal(value, 'a1a2c1c2b1b2', 'append was throttled successfully');
      start();
    }, 100);
  });

  asyncTest('debounce', 1, function() {
    var counter = 0;
    var incr = function(){ counter++; };
    var debouncedIncr = _.debounce(incr, 32);
    debouncedIncr(); debouncedIncr();
    _.delay(debouncedIncr, 16);
    _.delay(function(){ equal(counter, 1, 'incr was debounced'); start(); }, 96);
  });

  asyncTest('debounce asap', 4, function() {
    var a, b;
    var counter = 0;
    var incr = function(){ return ++counter; };
    var debouncedIncr = _.debounce(incr, 64, true);
    a = debouncedIncr();
    b = debouncedIncr();
    equal(a, 1);
    equal(b, 1);
    equal(counter, 1, 'incr was called immediately');
    _.delay(debouncedIncr, 16);
    _.delay(debouncedIncr, 32);
    _.delay(debouncedIncr, 48);
    _.delay(function(){ equal(counter, 1, 'incr was debounced'); start(); }, 128);
  });

  asyncTest('debounce asap recursively', 2, function() {
    var counter = 0;
    var debouncedIncr = _.debounce(function(){
      counter++;
      if (counter < 10) debouncedIncr();
    }, 32, true);
    debouncedIncr();
    equal(counter, 1, 'incr was called immediately');
    _.delay(function(){ equal(counter, 1, 'incr was debounced'); start(); }, 96);
  });

  asyncTest('debounce after system time is set backwards', 2, function() {
    var counter = 0;
    var origNowFunc = _.now;
    var debouncedIncr = _.debounce(function(){
      counter++;
    }, 100, true);

    debouncedIncr();
    equal(counter, 1, 'incr was called immediately');

    _.now = function () {
      return new Date(2013, 0, 1, 1, 1, 1);
    };

    _.delay(function() {
      debouncedIncr();
      equal(counter, 2, 'incr was debounced successfully');
      start();
      _.now = origNowFunc;
    }, 200);
  });

  asyncTest('debounce re-entrant', 2, function() {
    var sequence = [
      ['b1', 'b2']
    ];
    var value = '';
    var debouncedAppend;
    var append = function(arg){
      value += this + arg;
      var args = sequence.pop();
      if (args) {
        debouncedAppend.call(args[0], args[1]);
      }
    };
    debouncedAppend = _.debounce(append, 32);
    debouncedAppend.call('a1', 'a2');
    equal(value, '');
    _.delay(function(){
      equal(value, 'a1a2b1b2', 'append was debounced successfully');
      start();
    }, 100);
  });

  test('once', function() {
    var num = 0;
    var increment = _.once(function(){ return ++num; });
    increment();
    increment();
    equal(num, 1);

    equal(increment(), 1, 'stores a memo to the last value');
  });

  test('Recursive onced function.', 1, function() {
    var f = _.once(function(){
      ok(true);
      f();
    });
    f();
  });

  test('wrap', function() {
    var greet = function(name){ return 'hi: ' + name; };
    var backwards = _.wrap(greet, function(func, name){ return func(name) + ' ' + name.split('').reverse().join(''); });
    equal(backwards('moe'), 'hi: moe eom', 'wrapped the salutation function');

    var inner = function(){ return 'Hello '; };
    var obj   = {name : 'Moe'};
    obj.hi    = _.wrap(inner, function(fn){ return fn() + this.name; });
    equal(obj.hi(), 'Hello Moe');

    var noop    = function(){};
    var wrapped = _.wrap(noop, function(){ return Array.prototype.slice.call(arguments, 0); });
    var ret     = wrapped(['whats', 'your'], 'vector', 'victor');
    deepEqual(ret, [noop, ['whats', 'your'], 'vector', 'victor']);
  });

  test('negate', function() {
    var isOdd = function(n){ return n & 1; };
    equal(_.negate(isOdd)(2), true, 'should return the complement of the given function');
    equal(_.negate(isOdd)(3), false, 'should return the complement of the given function');
  });

  test('compose', function() {
    var greet = function(name){ return 'hi: ' + name; };
    var exclaim = function(sentence){ return sentence + '!'; };
    var composed = _.compose(exclaim, greet);
    equal(composed('moe'), 'hi: moe!', 'can compose a function that takes another');

    composed = _.compose(greet, exclaim);
    equal(composed('moe'), 'hi: moe!', 'in this case, the functions are also commutative');

    // f(g(h(x, y, z)))
    function h(x, y, z) {
      equal(arguments.length, 3, 'First function called with multiple args');
      return z * y;
    }
    function g(x) {
      equal(arguments.length, 1, 'Composed function is called with 1 argument');
      return x;
    }
    function f(x) {
      equal(arguments.length, 1, 'Composed function is called with 1 argument');
      return x * 2;
    }
    composed = _.compose(f, g, h);
    equal(composed(1, 2, 3), 12);
  });

  test('after', function() {
    var testAfter = function(afterAmount, timesCalled) {
      var afterCalled = 0;
      var after = _.after(afterAmount, function() {
        afterCalled++;
      });
      while (timesCalled--) after();
      return afterCalled;
    };

    equal(testAfter(5, 5), 1, 'after(N) should fire after being called N times');
    equal(testAfter(5, 4), 0, 'after(N) should not fire unless called N times');
    equal(testAfter(0, 0), 0, 'after(0) should not fire immediately');
    equal(testAfter(0, 1), 1, 'after(0) should fire when first invoked');
  });

  test('before', function() {
    var testBefore = function(beforeAmount, timesCalled) {
      var beforeCalled = 0;
      var before = _.before(beforeAmount, function() { beforeCalled++; });
      while (timesCalled--) before();
      return beforeCalled;
    };

    equal(testBefore(5, 5), 4, 'before(N) should not fire after being called N times');
    equal(testBefore(5, 4), 4, 'before(N) should fire before being called N times');
    equal(testBefore(0, 0), 0, 'before(0) should not fire immediately');
    equal(testBefore(0, 1), 0, 'before(0) should not fire when first invoked');

    var context = {num: 0};
    var increment = _.before(3, function(){ return ++this.num; });
    _.times(10, increment, context);
    equal(increment(), 2, 'stores a memo to the last value');
    equal(context.num, 2, 'provides context');
  });

  test('iteratee', function() {
    var identity = _.iteratee();
    equal(identity, _.identity, '_.iteratee is exposed as an external function.');

    function fn() {
      return arguments;
    }
    _.each([_.iteratee(fn), _.iteratee(fn, {})], function(cb) {
      equal(cb().length, 0);
      deepEqual(_.toArray(cb(1, 2, 3)), _.range(1, 4));
      deepEqual(_.toArray(cb(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)), _.range(1, 11));
    });
    
  });

}());



(function() {
  var _ = typeof require == 'function' ? require('..') : this._;

  QUnit.module('Objects');

  var testElement = typeof document === 'object' ? document.createElement('div') : void 0;

  test('keys', function() {
    deepEqual(_.keys({one : 1, two : 2}), ['one', 'two'], 'can extract the keys from an object');
    // the test above is not safe because it relies on for-in enumeration order
    var a = []; a[1] = 0;
    deepEqual(_.keys(a), ['1'], 'is not fooled by sparse arrays; see issue #95');
    deepEqual(_.keys(null), []);
    deepEqual(_.keys(void 0), []);
    deepEqual(_.keys(1), []);
    deepEqual(_.keys('a'), []);
    deepEqual(_.keys(true), []);

    // keys that may be missed if the implementation isn't careful
    var trouble = {
      'constructor': Object,
      'valueOf': _.noop,
      'hasOwnProperty': null,
      'toString': 5,
      'toLocaleString': undefined,
      'propertyIsEnumerable': /a/,
      'isPrototypeOf': this,
      '__defineGetter__': Boolean,
      '__defineSetter__': {},
      '__lookupSetter__': false,
      '__lookupGetter__': []
    };
    var troubleKeys = ['constructor', 'valueOf', 'hasOwnProperty', 'toString', 'toLocaleString', 'propertyIsEnumerable',
                  'isPrototypeOf', '__defineGetter__', '__defineSetter__', '__lookupSetter__', '__lookupGetter__'].sort();
    deepEqual(_.keys(trouble).sort(), troubleKeys, 'matches non-enumerable properties');
  });

  test('allKeys', function() {
    deepEqual(_.allKeys({one : 1, two : 2}), ['one', 'two'], 'can extract the allKeys from an object');
    // the test above is not safe because it relies on for-in enumeration order
    var a = []; a[1] = 0;
    deepEqual(_.allKeys(a), ['1'], 'is not fooled by sparse arrays; see issue #95');

    a.a = a;
    deepEqual(_.allKeys(a), ['1', 'a'], 'is not fooled by sparse arrays with additional properties');

    _.each([null, void 0, 1, 'a', true, NaN, {}, [], new Number(5), new Date(0)], function(val) {
      deepEqual(_.allKeys(val), []);
    });

    // allKeys that may be missed if the implementation isn't careful
    var trouble = {
      constructor: Object,
      valueOf: _.noop,
      hasOwnProperty: null,
      toString: 5,
      toLocaleString: undefined,
      propertyIsEnumerable: /a/,
      isPrototypeOf: this
    };
    var troubleKeys = ['constructor', 'valueOf', 'hasOwnProperty', 'toString', 'toLocaleString', 'propertyIsEnumerable',
                  'isPrototypeOf'].sort();
    deepEqual(_.allKeys(trouble).sort(), troubleKeys, 'matches non-enumerable properties');

    function A() {}
    A.prototype.foo = 'foo';
    var b = new A();
    b.bar = 'bar';
    deepEqual(_.allKeys(b).sort(), ['bar', 'foo'], 'should include inherited keys');

    function y() {}
    y.x = 'z';
    deepEqual(_.allKeys(y), ['x'], 'should get keys from constructor');
  });

  test('values', function() {
    deepEqual(_.values({one: 1, two: 2}), [1, 2], 'can extract the values from an object');
    deepEqual(_.values({one: 1, two: 2, length: 3}), [1, 2, 3], '... even when one of them is "length"');
  });

  test('pairs', function() {
    deepEqual(_.pairs({one: 1, two: 2}), [['one', 1], ['two', 2]], 'can convert an object into pairs');
    deepEqual(_.pairs({one: 1, two: 2, length: 3}), [['one', 1], ['two', 2], ['length', 3]], '... even when one of them is "length"');
  });

  test('invert', function() {
    var obj = {first: 'Moe', second: 'Larry', third: 'Curly'};
    deepEqual(_.keys(_.invert(obj)), ['Moe', 'Larry', 'Curly'], 'can invert an object');
    deepEqual(_.invert(_.invert(obj)), obj, 'two inverts gets you back where you started');

    obj = {length: 3};
    equal(_.invert(obj)['3'], 'length', 'can invert an object with "length"');
  });

  test('functions', function() {
    var obj = {a : 'dash', b : _.map, c : /yo/, d : _.reduce};
    deepEqual(['b', 'd'], _.functions(obj), 'can grab the function names of any passed-in object');

    var Animal = function(){};
    Animal.prototype.run = function(){};
    deepEqual(_.functions(new Animal), ['run'], 'also looks up functions on the prototype');
  });

  test('methods', function() {
    strictEqual(_.functions, _.methods, 'alias for functions');
  });

  test('extend', function() {
    var result;
    equal(_.extend({}, {a: 'b'}).a, 'b', 'can extend an object with the attributes of another');
    equal(_.extend({a: 'x'}, {a: 'b'}).a, 'b', 'properties in source override destination');
    equal(_.extend({x: 'x'}, {a: 'b'}).x, 'x', "properties not in source don't get overriden");
    result = _.extend({x: 'x'}, {a: 'a'}, {b: 'b'});
    deepEqual(result, {x: 'x', a: 'a', b: 'b'}, 'can extend from multiple source objects');
    result = _.extend({x: 'x'}, {a: 'a', x: 2}, {a: 'b'});
    deepEqual(result, {x: 2, a: 'b'}, 'extending from multiple source objects last property trumps');
    result = _.extend({}, {a: void 0, b: null});
    deepEqual(_.keys(result), ['a', 'b'], 'extend copies undefined values');

    var F = function() {};
    F.prototype = {a: 'b'};
    var subObj = new F();
    subObj.c = 'd';
    deepEqual(_.extend({}, subObj), {a: 'b', c: 'd'}, 'extend copies all properties from source');
    _.extend(subObj, {});
    ok(!subObj.hasOwnProperty('a'), "extend does not convert destination object's 'in' properties to 'own' properties");

    try {
      result = {};
      _.extend(result, null, undefined, {a: 1});
    } catch(ex) {}

    equal(result.a, 1, 'should not error on `null` or `undefined` sources');

    strictEqual(_.extend(null, {a: 1}), null, 'extending null results in null');
    strictEqual(_.extend(undefined, {a: 1}), undefined, 'extending undefined results in undefined');
  });

  test('extendOwn', function() {
    var result;
    equal(_.extendOwn({}, {a: 'b'}).a, 'b', 'can assign an object with the attributes of another');
    equal(_.extendOwn({a: 'x'}, {a: 'b'}).a, 'b', 'properties in source override destination');
    equal(_.extendOwn({x: 'x'}, {a: 'b'}).x, 'x', "properties not in source don't get overriden");
    result = _.extendOwn({x: 'x'}, {a: 'a'}, {b: 'b'});
    deepEqual(result, {x: 'x', a: 'a', b: 'b'}, 'can assign from multiple source objects');
    result = _.assign({x: 'x'}, {a: 'a', x: 2}, {a: 'b'});
    deepEqual(result, {x: 2, a: 'b'}, 'assigning from multiple source objects last property trumps');
    deepEqual(_.extendOwn({}, {a: void 0, b: null}), {a: void 0, b: null}, 'assign copies undefined values');

    var F = function() {};
    F.prototype = {a: 'b'};
    var subObj = new F();
    subObj.c = 'd';
    deepEqual(_.extendOwn({}, subObj), {c: 'd'}, 'assign copies own properties from source');

    result = {};
    deepEqual(_.assign(result, null, undefined, {a: 1}), {a: 1}, 'should not error on `null` or `undefined` sources');

    _.each(['a', 5, null, false], function(val) {
      strictEqual(_.assign(val, {a: 1}), val, 'assigning non-objects results in returning the non-object value');
    });

    strictEqual(_.extendOwn(undefined, {a: 1}), undefined, 'assigning undefined results in undefined');

    result = _.extendOwn({a: 1, 0: 2, 1: '5', length: 6}, {0: 1, 1: 2, length: 2});
    deepEqual(result, {a: 1, 0: 1, 1: 2, length: 2}, 'assign should treat array-like objects like normal objects');
  });

  test('pick', function() {
    var result;
    result = _.pick({a: 1, b: 2, c: 3}, 'a', 'c');
    deepEqual(result, {a: 1, c: 3}, 'can restrict properties to those named');
    result = _.pick({a: 1, b: 2, c: 3}, ['b', 'c']);
    deepEqual(result, {b: 2, c: 3}, 'can restrict properties to those named in an array');
    result = _.pick({a: 1, b: 2, c: 3}, ['a'], 'b');
    deepEqual(result, {a: 1, b: 2}, 'can restrict properties to those named in mixed args');
    result = _.pick(['a', 'b'], 1);
    deepEqual(result, {1: 'b'}, 'can pick numeric properties');

    _.each([null, void 0], function(val) {
      deepEqual(_.pick(val, 'hasOwnProperty'), {}, 'Called with null/undefined');
      deepEqual(_.pick(val, _.constant(true)), {});
    });
    deepEqual(_.pick(5, 'toString', 'b'), {toString: Number.prototype.toString}, 'can iterate primitives');

    var data = {a: 1, b: 2, c: 3};
    var callback = function(value, key, object) {
      strictEqual(key, {1: 'a', 2: 'b', 3: 'c'}[value]);
      strictEqual(object, data);
      return value !== this.value;
    };
    result = _.pick(data, callback, {value: 2});
    deepEqual(result, {a: 1, c: 3}, 'can accept a predicate and context');

    var Obj = function(){};
    Obj.prototype = {a: 1, b: 2, c: 3};
    var instance = new Obj();
    deepEqual(_.pick(instance, 'a', 'c'), {a: 1, c: 3}, 'include prototype props');

    deepEqual(_.pick(data, function(val, key) {
      return this[key] === 3 && this === instance;
    }, instance), {c: 3}, 'function is given context');

    ok(!_.has(_.pick({}, 'foo'), 'foo'), 'does not set own property if property not in object');
    _.pick(data, function(value, key, obj) {
      equal(obj, data, 'passes same object as third parameter of iteratee');
    });
  });

  test('omit', function() {
    var result;
    result = _.omit({a: 1, b: 2, c: 3}, 'b');
    deepEqual(result, {a: 1, c: 3}, 'can omit a single named property');
    result = _.omit({a: 1, b: 2, c: 3}, 'a', 'c');
    deepEqual(result, {b: 2}, 'can omit several named properties');
    result = _.omit({a: 1, b: 2, c: 3}, ['b', 'c']);
    deepEqual(result, {a: 1}, 'can omit properties named in an array');
    result = _.omit(['a', 'b'], 0);
    deepEqual(result, {1: 'b'}, 'can omit numeric properties');

    deepEqual(_.omit(null, 'a', 'b'), {}, 'non objects return empty object');
    deepEqual(_.omit(undefined, 'toString'), {}, 'null/undefined return empty object');
    deepEqual(_.omit(5, 'toString', 'b'), {}, 'returns empty object for primitives');

    var data = {a: 1, b: 2, c: 3};
    var callback = function(value, key, object) {
      strictEqual(key, {1: 'a', 2: 'b', 3: 'c'}[value]);
      strictEqual(object, data);
      return value !== this.value;
    };
    result = _.omit(data, callback, {value: 2});
    deepEqual(result, {b: 2}, 'can accept a predicate');

    var Obj = function(){};
    Obj.prototype = {a: 1, b: 2, c: 3};
    var instance = new Obj();
    deepEqual(_.omit(instance, 'b'), {a: 1, c: 3}, 'include prototype props');

    deepEqual(_.omit(data, function(val, key) {
      return this[key] === 3 && this === instance;
    }, instance), {a: 1, b: 2}, 'function is given context');
  });

  test('defaults', function() {
    var options = {zero: 0, one: 1, empty: '', nan: NaN, nothing: null};

    _.defaults(options, {zero: 1, one: 10, twenty: 20, nothing: 'str'});
    equal(options.zero, 0, 'value exists');
    equal(options.one, 1, 'value exists');
    equal(options.twenty, 20, 'default applied');
    equal(options.nothing, null, "null isn't overridden");

    _.defaults(options, {empty: 'full'}, {nan: 'nan'}, {word: 'word'}, {word: 'dog'});
    equal(options.empty, '', 'value exists');
    ok(_.isNaN(options.nan), "NaN isn't overridden");
    equal(options.word, 'word', 'new value is added, first one wins');

    try {
      options = {};
      _.defaults(options, null, undefined, {a: 1});
    } catch(ex) {}

    equal(options.a, 1, 'should not error on `null` or `undefined` sources');

    strictEqual(_.defaults(null, {a: 1}), null, 'result is null if destination is null');
    strictEqual(_.defaults(undefined, {a: 1}), undefined, 'result is undefined if destination is undefined');
  });

  test('clone', function() {
    var moe = {name : 'moe', lucky : [13, 27, 34]};
    var clone = _.clone(moe);
    equal(clone.name, 'moe', 'the clone as the attributes of the original');

    clone.name = 'curly';
    ok(clone.name === 'curly' && moe.name === 'moe', 'clones can change shallow attributes without affecting the original');

    clone.lucky.push(101);
    equal(_.last(moe.lucky), 101, 'changes to deep attributes are shared with the original');

    equal(_.clone(undefined), void 0, 'non objects should not be changed by clone');
    equal(_.clone(1), 1, 'non objects should not be changed by clone');
    equal(_.clone(null), null, 'non objects should not be changed by clone');
  });

  test('create', function() {
    var Parent = function() {};
    Parent.prototype = {foo: function() {}, bar: 2};

    _.each(['foo', null, undefined, 1], function(val) {
      deepEqual(_.create(val), {}, 'should return empty object when a non-object is provided');
    });

    ok(_.create([]) instanceof Array, 'should return new instance of array when array is provided');

    var Child = function() {};
    Child.prototype = _.create(Parent.prototype);
    ok(new Child instanceof Parent, 'object should inherit prototype');

    var func = function() {};
    Child.prototype = _.create(Parent.prototype, {func: func});
    strictEqual(Child.prototype.func, func, 'properties should be added to object');

    Child.prototype = _.create(Parent.prototype, {constructor: Child});
    strictEqual(Child.prototype.constructor, Child);

    Child.prototype.foo = 'foo';
    var created = _.create(Child.prototype, new Child);
    ok(!created.hasOwnProperty('foo'), 'should only add own properties');
  });

  test('isEqual', function() {
    function First() {
      this.value = 1;
    }
    First.prototype.value = 1;
    function Second() {
      this.value = 1;
    }
    Second.prototype.value = 2;

    // Basic equality and identity comparisons.
    ok(_.isEqual(null, null), '`null` is equal to `null`');
    ok(_.isEqual(), '`undefined` is equal to `undefined`');

    ok(!_.isEqual(0, -0), '`0` is not equal to `-0`');
    ok(!_.isEqual(-0, 0), 'Commutative equality is implemented for `0` and `-0`');
    ok(!_.isEqual(null, undefined), '`null` is not equal to `undefined`');
    ok(!_.isEqual(undefined, null), 'Commutative equality is implemented for `null` and `undefined`');

    // String object and primitive comparisons.
    ok(_.isEqual('Curly', 'Curly'), 'Identical string primitives are equal');
    ok(_.isEqual(new String('Curly'), new String('Curly')), 'String objects with identical primitive values are equal');
    ok(_.isEqual(new String('Curly'), 'Curly'), 'String primitives and their corresponding object wrappers are equal');
    ok(_.isEqual('Curly', new String('Curly')), 'Commutative equality is implemented for string objects and primitives');

    ok(!_.isEqual('Curly', 'Larry'), 'String primitives with different values are not equal');
    ok(!_.isEqual(new String('Curly'), new String('Larry')), 'String objects with different primitive values are not equal');
    ok(!_.isEqual(new String('Curly'), {toString: function(){ return 'Curly'; }}), 'String objects and objects with a custom `toString` method are not equal');

    // Number object and primitive comparisons.
    ok(_.isEqual(75, 75), 'Identical number primitives are equal');
    ok(_.isEqual(new Number(75), new Number(75)), 'Number objects with identical primitive values are equal');
    ok(_.isEqual(75, new Number(75)), 'Number primitives and their corresponding object wrappers are equal');
    ok(_.isEqual(new Number(75), 75), 'Commutative equality is implemented for number objects and primitives');
    ok(!_.isEqual(new Number(0), -0), '`new Number(0)` and `-0` are not equal');
    ok(!_.isEqual(0, new Number(-0)), 'Commutative equality is implemented for `new Number(0)` and `-0`');

    ok(!_.isEqual(new Number(75), new Number(63)), 'Number objects with different primitive values are not equal');
    ok(!_.isEqual(new Number(63), {valueOf: function(){ return 63; }}), 'Number objects and objects with a `valueOf` method are not equal');

    // Comparisons involving `NaN`.
    ok(_.isEqual(NaN, NaN), '`NaN` is equal to `NaN`');
    ok(_.isEqual(new Object(NaN), NaN), 'Object(`NaN`) is equal to `NaN`');
    ok(!_.isEqual(61, NaN), 'A number primitive is not equal to `NaN`');
    ok(!_.isEqual(new Number(79), NaN), 'A number object is not equal to `NaN`');
    ok(!_.isEqual(Infinity, NaN), '`Infinity` is not equal to `NaN`');

    // Boolean object and primitive comparisons.
    ok(_.isEqual(true, true), 'Identical boolean primitives are equal');
    ok(_.isEqual(new Boolean, new Boolean), 'Boolean objects with identical primitive values are equal');
    ok(_.isEqual(true, new Boolean(true)), 'Boolean primitives and their corresponding object wrappers are equal');
    ok(_.isEqual(new Boolean(true), true), 'Commutative equality is implemented for booleans');
    ok(!_.isEqual(new Boolean(true), new Boolean), 'Boolean objects with different primitive values are not equal');

    // Common type coercions.
    ok(!_.isEqual(new Boolean(false), true), '`new Boolean(false)` is not equal to `true`');
    ok(!_.isEqual('75', 75), 'String and number primitives with like values are not equal');
    ok(!_.isEqual(new Number(63), new String(63)), 'String and number objects with like values are not equal');
    ok(!_.isEqual(75, '75'), 'Commutative equality is implemented for like string and number values');
    ok(!_.isEqual(0, ''), 'Number and string primitives with like values are not equal');
    ok(!_.isEqual(1, true), 'Number and boolean primitives with like values are not equal');
    ok(!_.isEqual(new Boolean(false), new Number(0)), 'Boolean and number objects with like values are not equal');
    ok(!_.isEqual(false, new String('')), 'Boolean primitives and string objects with like values are not equal');
    ok(!_.isEqual(12564504e5, new Date(2009, 9, 25)), 'Dates and their corresponding numeric primitive values are not equal');

    // Dates.
    ok(_.isEqual(new Date(2009, 9, 25), new Date(2009, 9, 25)), 'Date objects referencing identical times are equal');
    ok(!_.isEqual(new Date(2009, 9, 25), new Date(2009, 11, 13)), 'Date objects referencing different times are not equal');
    ok(!_.isEqual(new Date(2009, 11, 13), {
      getTime: function(){
        return 12606876e5;
      }
    }), 'Date objects and objects with a `getTime` method are not equal');
    ok(!_.isEqual(new Date('Curly'), new Date('Curly')), 'Invalid dates are not equal');

    // Functions.
    ok(!_.isEqual(First, Second), 'Different functions with identical bodies and source code representations are not equal');

    // RegExps.
    ok(_.isEqual(/(?:)/gim, /(?:)/gim), 'RegExps with equivalent patterns and flags are equal');
    ok(_.isEqual(/(?:)/gi, /(?:)/ig), 'Flag order is not significant');
    ok(!_.isEqual(/(?:)/g, /(?:)/gi), 'RegExps with equivalent patterns and different flags are not equal');
    ok(!_.isEqual(/Moe/gim, /Curly/gim), 'RegExps with different patterns and equivalent flags are not equal');
    ok(!_.isEqual(/(?:)/gi, /(?:)/g), 'Commutative equality is implemented for RegExps');
    ok(!_.isEqual(/Curly/g, {source: 'Larry', global: true, ignoreCase: false, multiline: false}), 'RegExps and RegExp-like objects are not equal');

    // Empty arrays, array-like objects, and object literals.
    ok(_.isEqual({}, {}), 'Empty object literals are equal');
    ok(_.isEqual([], []), 'Empty array literals are equal');
    ok(_.isEqual([{}], [{}]), 'Empty nested arrays and objects are equal');
    ok(!_.isEqual({length: 0}, []), 'Array-like objects and arrays are not equal.');
    ok(!_.isEqual([], {length: 0}), 'Commutative equality is implemented for array-like objects');

    ok(!_.isEqual({}, []), 'Object literals and array literals are not equal');
    ok(!_.isEqual([], {}), 'Commutative equality is implemented for objects and arrays');

    // Arrays with primitive and object values.
    ok(_.isEqual([1, 'Larry', true], [1, 'Larry', true]), 'Arrays containing identical primitives are equal');
    ok(_.isEqual([/Moe/g, new Date(2009, 9, 25)], [/Moe/g, new Date(2009, 9, 25)]), 'Arrays containing equivalent elements are equal');

    // Multi-dimensional arrays.
    var a = [new Number(47), false, 'Larry', /Moe/, new Date(2009, 11, 13), ['running', 'biking', new String('programming')], {a: 47}];
    var b = [new Number(47), false, 'Larry', /Moe/, new Date(2009, 11, 13), ['running', 'biking', new String('programming')], {a: 47}];
    ok(_.isEqual(a, b), 'Arrays containing nested arrays and objects are recursively compared');

    // Overwrite the methods defined in ES 5.1 section 15.4.4.
    a.forEach = a.map = a.filter = a.every = a.indexOf = a.lastIndexOf = a.some = a.reduce = a.reduceRight = null;
    b.join = b.pop = b.reverse = b.shift = b.slice = b.splice = b.concat = b.sort = b.unshift = null;

    // Array elements and properties.
    ok(_.isEqual(a, b), 'Arrays containing equivalent elements and different non-numeric properties are equal');
    a.push('White Rocks');
    ok(!_.isEqual(a, b), 'Arrays of different lengths are not equal');
    a.push('East Boulder');
    b.push('Gunbarrel Ranch', 'Teller Farm');
    ok(!_.isEqual(a, b), 'Arrays of identical lengths containing different elements are not equal');

    // Sparse arrays.
    ok(_.isEqual(Array(3), Array(3)), 'Sparse arrays of identical lengths are equal');
    ok(!_.isEqual(Array(3), Array(6)), 'Sparse arrays of different lengths are not equal when both are empty');

    var sparse = [];
    sparse[1] = 5;
    ok(_.isEqual(sparse, [undefined, 5]), 'Handles sparse arrays as dense');

    // Simple objects.
    ok(_.isEqual({a: 'Curly', b: 1, c: true}, {a: 'Curly', b: 1, c: true}), 'Objects containing identical primitives are equal');
    ok(_.isEqual({a: /Curly/g, b: new Date(2009, 11, 13)}, {a: /Curly/g, b: new Date(2009, 11, 13)}), 'Objects containing equivalent members are equal');
    ok(!_.isEqual({a: 63, b: 75}, {a: 61, b: 55}), 'Objects of identical sizes with different values are not equal');
    ok(!_.isEqual({a: 63, b: 75}, {a: 61, c: 55}), 'Objects of identical sizes with different property names are not equal');
    ok(!_.isEqual({a: 1, b: 2}, {a: 1}), 'Objects of different sizes are not equal');
    ok(!_.isEqual({a: 1}, {a: 1, b: 2}), 'Commutative equality is implemented for objects');
    ok(!_.isEqual({x: 1, y: undefined}, {x: 1, z: 2}), 'Objects with identical keys and different values are not equivalent');

    // `A` contains nested objects and arrays.
    a = {
      name: new String('Moe Howard'),
      age: new Number(77),
      stooge: true,
      hobbies: ['acting'],
      film: {
        name: 'Sing a Song of Six Pants',
        release: new Date(1947, 9, 30),
        stars: [new String('Larry Fine'), 'Shemp Howard'],
        minutes: new Number(16),
        seconds: 54
      }
    };

    // `B` contains equivalent nested objects and arrays.
    b = {
      name: new String('Moe Howard'),
      age: new Number(77),
      stooge: true,
      hobbies: ['acting'],
      film: {
        name: 'Sing a Song of Six Pants',
        release: new Date(1947, 9, 30),
        stars: [new String('Larry Fine'), 'Shemp Howard'],
        minutes: new Number(16),
        seconds: 54
      }
    };
    ok(_.isEqual(a, b), 'Objects with nested equivalent members are recursively compared');

    // Instances.
    ok(_.isEqual(new First, new First), 'Object instances are equal');
    ok(!_.isEqual(new First, new Second), 'Objects with different constructors and identical own properties are not equal');
    ok(!_.isEqual({value: 1}, new First), 'Object instances and objects sharing equivalent properties are not equal');
    ok(!_.isEqual({value: 2}, new Second), 'The prototype chain of objects should not be examined');

    // Circular Arrays.
    (a = []).push(a);
    (b = []).push(b);
    ok(_.isEqual(a, b), 'Arrays containing circular references are equal');
    a.push(new String('Larry'));
    b.push(new String('Larry'));
    ok(_.isEqual(a, b), 'Arrays containing circular references and equivalent properties are equal');
    a.push('Shemp');
    b.push('Curly');
    ok(!_.isEqual(a, b), 'Arrays containing circular references and different properties are not equal');

    // More circular arrays #767.
    a = ['everything is checked but', 'this', 'is not'];
    a[1] = a;
    b = ['everything is checked but', ['this', 'array'], 'is not'];
    ok(!_.isEqual(a, b), 'Comparison of circular references with non-circular references are not equal');

    // Circular Objects.
    a = {abc: null};
    b = {abc: null};
    a.abc = a;
    b.abc = b;
    ok(_.isEqual(a, b), 'Objects containing circular references are equal');
    a.def = 75;
    b.def = 75;
    ok(_.isEqual(a, b), 'Objects containing circular references and equivalent properties are equal');
    a.def = new Number(75);
    b.def = new Number(63);
    ok(!_.isEqual(a, b), 'Objects containing circular references and different properties are not equal');

    // More circular objects #767.
    a = {everything: 'is checked', but: 'this', is: 'not'};
    a.but = a;
    b = {everything: 'is checked', but: {that: 'object'}, is: 'not'};
    ok(!_.isEqual(a, b), 'Comparison of circular references with non-circular object references are not equal');

    // Cyclic Structures.
    a = [{abc: null}];
    b = [{abc: null}];
    (a[0].abc = a).push(a);
    (b[0].abc = b).push(b);
    ok(_.isEqual(a, b), 'Cyclic structures are equal');
    a[0].def = 'Larry';
    b[0].def = 'Larry';
    ok(_.isEqual(a, b), 'Cyclic structures containing equivalent properties are equal');
    a[0].def = new String('Larry');
    b[0].def = new String('Curly');
    ok(!_.isEqual(a, b), 'Cyclic structures containing different properties are not equal');

    // Complex Circular References.
    a = {foo: {b: {foo: {c: {foo: null}}}}};
    b = {foo: {b: {foo: {c: {foo: null}}}}};
    a.foo.b.foo.c.foo = a;
    b.foo.b.foo.c.foo = b;
    ok(_.isEqual(a, b), 'Cyclic structures with nested and identically-named properties are equal');

    // Chaining.
    ok(!_.isEqual(_({x: 1, y: undefined}).chain(), _({x: 1, z: 2}).chain()), 'Chained objects containing different values are not equal');

    a = _({x: 1, y: 2}).chain();
    b = _({x: 1, y: 2}).chain();
    equal(_.isEqual(a.isEqual(b), _(true)), true, '`isEqual` can be chained');

    // Objects without a `constructor` property
    if (Object.create) {
        a = Object.create(null, {x: {value: 1, enumerable: true}});
        b = {x: 1};
        ok(_.isEqual(a, b), 'Handles objects without a constructor (e.g. from Object.create');
    }

    function Foo() { this.a = 1; }
    Foo.prototype.constructor = null;

    var other = {a: 1};
    strictEqual(_.isEqual(new Foo, other), false, 'Objects from different constructors are not equal');
  });

  test('isEmpty', function() {
    ok(!_([1]).isEmpty(), '[1] is not empty');
    ok(_.isEmpty([]), '[] is empty');
    ok(!_.isEmpty({one : 1}), '{one : 1} is not empty');
    ok(_.isEmpty({}), '{} is empty');
    ok(_.isEmpty(new RegExp('')), 'objects with prototype properties are empty');
    ok(_.isEmpty(null), 'null is empty');
    ok(_.isEmpty(), 'undefined is empty');
    ok(_.isEmpty(''), 'the empty string is empty');
    ok(!_.isEmpty('moe'), 'but other strings are not');

    var obj = {one : 1};
    delete obj.one;
    ok(_.isEmpty(obj), 'deleting all the keys from an object empties it');

    var args = function(){ return arguments; };
    ok(_.isEmpty(args()), 'empty arguments object is empty');
    ok(!_.isEmpty(args('')), 'non-empty arguments object is not empty');

    // covers collecting non-enumerable properties in IE < 9
    var nonEnumProp = {'toString': 5};
    ok(!_.isEmpty(nonEnumProp), 'non-enumerable property is not empty');
  });

  if (typeof document === 'object') {
    test('isElement', function() {
      ok(!_.isElement('div'), 'strings are not dom elements');
      ok(_.isElement(testElement), 'an element is a DOM element');
    });
  }

  test('isArguments', function() {
    var args = (function(){ return arguments; }(1, 2, 3));
    ok(!_.isArguments('string'), 'a string is not an arguments object');
    ok(!_.isArguments(_.isArguments), 'a function is not an arguments object');
    ok(_.isArguments(args), 'but the arguments object is an arguments object');
    ok(!_.isArguments(_.toArray(args)), 'but not when it\'s converted into an array');
    ok(!_.isArguments([1, 2, 3]), 'and not vanilla arrays.');
  });

  test('isObject', function() {
    ok(_.isObject(arguments), 'the arguments object is object');
    ok(_.isObject([1, 2, 3]), 'and arrays');
    if (testElement) {
      ok(_.isObject(testElement), 'and DOM element');
    }
    ok(_.isObject(function () {}), 'and functions');
    ok(!_.isObject(null), 'but not null');
    ok(!_.isObject(undefined), 'and not undefined');
    ok(!_.isObject('string'), 'and not string');
    ok(!_.isObject(12), 'and not number');
    ok(!_.isObject(true), 'and not boolean');
    ok(_.isObject(new String('string')), 'but new String()');
  });

  test('isArray', function() {
    ok(!_.isArray(undefined), 'undefined vars are not arrays');
    ok(!_.isArray(arguments), 'the arguments object is not an array');
    ok(_.isArray([1, 2, 3]), 'but arrays are');
  });

  test('isString', function() {
    var obj = new String('I am a string object');
    if (testElement) {
      ok(!_.isString(testElement), 'an element is not a string');
    }
    ok(_.isString([1, 2, 3].join(', ')), 'but strings are');
    strictEqual(_.isString('I am a string literal'), true, 'string literals are');
    ok(_.isString(obj), 'so are String objects');
    strictEqual(_.isString(1), false);
  });

  test('isNumber', function() {
    ok(!_.isNumber('string'), 'a string is not a number');
    ok(!_.isNumber(arguments), 'the arguments object is not a number');
    ok(!_.isNumber(undefined), 'undefined is not a number');
    ok(_.isNumber(3 * 4 - 7 / 10), 'but numbers are');
    ok(_.isNumber(NaN), 'NaN *is* a number');
    ok(_.isNumber(Infinity), 'Infinity is a number');
    ok(!_.isNumber('1'), 'numeric strings are not numbers');
  });

  test('isBoolean', function() {
    ok(!_.isBoolean(2), 'a number is not a boolean');
    ok(!_.isBoolean('string'), 'a string is not a boolean');
    ok(!_.isBoolean('false'), 'the string "false" is not a boolean');
    ok(!_.isBoolean('true'), 'the string "true" is not a boolean');
    ok(!_.isBoolean(arguments), 'the arguments object is not a boolean');
    ok(!_.isBoolean(undefined), 'undefined is not a boolean');
    ok(!_.isBoolean(NaN), 'NaN is not a boolean');
    ok(!_.isBoolean(null), 'null is not a boolean');
    ok(_.isBoolean(true), 'but true is');
    ok(_.isBoolean(false), 'and so is false');
  });

  test('isFunction', function() {
    ok(!_.isFunction(undefined), 'undefined vars are not functions');
    ok(!_.isFunction([1, 2, 3]), 'arrays are not functions');
    ok(!_.isFunction('moe'), 'strings are not functions');
    ok(_.isFunction(_.isFunction), 'but functions are');
    ok(_.isFunction(function(){}), 'even anonymous ones');

    if (testElement) {
      ok(!_.isFunction(testElement), 'elements are not functions');
    }
  });

  if (typeof Int8Array !== 'undefined') {
    test('#1929 Typed Array constructors are functions', function() {
      _.chain(['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array'])
      .map(_.propertyOf(typeof GLOBAL != 'undefined' ? GLOBAL : window))
      .compact()
      .each(function(TypedArray) {
          // PhantomJS reports `typeof UInt8Array == 'object'` and doesn't report toString TypeArray
          // as a function
          strictEqual(_.isFunction(TypedArray), Object.prototype.toString.call(TypedArray) === '[object Function]');
      });
    });
  }

  test('isDate', function() {
    ok(!_.isDate(100), 'numbers are not dates');
    ok(!_.isDate({}), 'objects are not dates');
    ok(_.isDate(new Date()), 'but dates are');
  });

  test('isRegExp', function() {
    ok(!_.isRegExp(_.identity), 'functions are not RegExps');
    ok(_.isRegExp(/identity/), 'but RegExps are');
  });

  test('isFinite', function() {
    ok(!_.isFinite(undefined), 'undefined is not finite');
    ok(!_.isFinite(null), 'null is not finite');
    ok(!_.isFinite(NaN), 'NaN is not finite');
    ok(!_.isFinite(Infinity), 'Infinity is not finite');
    ok(!_.isFinite(-Infinity), '-Infinity is not finite');
    ok(_.isFinite('12'), 'Numeric strings are numbers');
    ok(!_.isFinite('1a'), 'Non numeric strings are not numbers');
    ok(!_.isFinite(''), 'Empty strings are not numbers');
    var obj = new Number(5);
    ok(_.isFinite(obj), 'Number instances can be finite');
    ok(_.isFinite(0), '0 is finite');
    ok(_.isFinite(123), 'Ints are finite');
    ok(_.isFinite(-12.44), 'Floats are finite');
  });

  test('isNaN', function() {
    ok(!_.isNaN(undefined), 'undefined is not NaN');
    ok(!_.isNaN(null), 'null is not NaN');
    ok(!_.isNaN(0), '0 is not NaN');
    ok(_.isNaN(NaN), 'but NaN is');
    ok(_.isNaN(new Number(NaN)), 'wrapped NaN is still NaN');
  });

  test('isNull', function() {
    ok(!_.isNull(undefined), 'undefined is not null');
    ok(!_.isNull(NaN), 'NaN is not null');
    ok(_.isNull(null), 'but null is');
  });

  test('isUndefined', function() {
    ok(!_.isUndefined(1), 'numbers are defined');
    ok(!_.isUndefined(null), 'null is defined');
    ok(!_.isUndefined(false), 'false is defined');
    ok(!_.isUndefined(NaN), 'NaN is defined');
    ok(_.isUndefined(), 'nothing is undefined');
    ok(_.isUndefined(undefined), 'undefined is undefined');
  });

  test('isError', function() {
    ok(!_.isError(1), 'numbers are not Errors');
    ok(!_.isError(null), 'null is not an Error');
    ok(!_.isError(Error), 'functions are not Errors');
    ok(_.isError(new Error()), 'Errors are Errors');
    ok(_.isError(new EvalError()), 'EvalErrors are Errors');
    ok(_.isError(new RangeError()), 'RangeErrors are Errors');
    ok(_.isError(new ReferenceError()), 'ReferenceErrors are Errors');
    ok(_.isError(new SyntaxError()), 'SyntaxErrors are Errors');
    ok(_.isError(new TypeError()), 'TypeErrors are Errors');
    ok(_.isError(new URIError()), 'URIErrors are Errors');
  });

  test('tap', function() {
    var intercepted = null;
    var interceptor = function(obj) { intercepted = obj; };
    var returned = _.tap(1, interceptor);
    equal(intercepted, 1, 'passes tapped object to interceptor');
    equal(returned, 1, 'returns tapped object');

    returned = _([1, 2, 3]).chain().
      map(function(n){ return n * 2; }).
      max().
      tap(interceptor).
      value();
    equal(returned, 6, 'can use tapped objects in a chain');
    equal(intercepted, returned, 'can use tapped objects in a chain');
  });

  test('has', function () {
    var obj = {foo: 'bar', func: function(){}};
    ok(_.has(obj, 'foo'), 'has() checks that the object has a property.');
    ok(!_.has(obj, 'baz'), "has() returns false if the object doesn't have the property.");
    ok(_.has(obj, 'func'), 'has() works for functions too.');
    obj.hasOwnProperty = null;
    ok(_.has(obj, 'foo'), 'has() works even when the hasOwnProperty method is deleted.');
    var child = {};
    child.prototype = obj;
    ok(!_.has(child, 'foo'), 'has() does not check the prototype chain for a property.');
    strictEqual(_.has(null, 'foo'), false, 'has() returns false for null');
    strictEqual(_.has(undefined, 'foo'), false, 'has() returns false for undefined');
  });

  test('isMatch', function() {
    var moe = {name: 'Moe Howard', hair: true};
    var curly = {name: 'Curly Howard', hair: false};

    equal(_.isMatch(moe, {hair: true}), true, 'Returns a boolean');
    equal(_.isMatch(curly, {hair: true}), false, 'Returns a boolean');

    equal(_.isMatch(5, {__x__: undefined}), false, 'can match undefined props on primitives');
    equal(_.isMatch({__x__: undefined}, {__x__: undefined}), true, 'can match undefined props');

    equal(_.isMatch(null, {}), true, 'Empty spec called with null object returns true');
    equal(_.isMatch(null, {a: 1}), false, 'Non-empty spec called with null object returns false');

    _.each([null, undefined], function(item) { strictEqual(_.isMatch(item, null), true, 'null matches null'); });
    _.each([null, undefined], function(item) { strictEqual(_.isMatch(item, null), true, 'null matches {}'); });
    strictEqual(_.isMatch({b: 1}, {a: undefined}), false, 'handles undefined values (1683)');

    _.each([true, 5, NaN, null, undefined], function(item) {
      strictEqual(_.isMatch({a: 1}, item), true, 'treats primitives as empty');
    });

    function Prototest() {}
    Prototest.prototype.x = 1;
    var specObj = new Prototest;
    equal(_.isMatch({x: 2}, specObj), true, 'spec is restricted to own properties');

    specObj.y = 5;
    equal(_.isMatch({x: 1, y: 5}, specObj), true);
    equal(_.isMatch({x: 1, y: 4}, specObj), false);

    ok(_.isMatch(specObj, {x: 1, y: 5}), 'inherited and own properties are checked on the test object');

    Prototest.x = 5;
    ok(_.isMatch({x: 5, y: 1}, Prototest), 'spec can be a function');

    //null edge cases
    var oCon = {'constructor': Object};
    deepEqual(_.map([null, undefined, 5, {}], _.partial(_.isMatch, _, oCon)), [false, false, false, true], 'doesnt falsey match constructor on undefined/null');
  });

  test('matcher', function() {
    var moe = {name: 'Moe Howard', hair: true};
    var curly = {name: 'Curly Howard', hair: false};
    var stooges = [moe, curly];

    equal(_.matcher({hair: true})(moe), true, 'Returns a boolean');
    equal(_.matcher({hair: true})(curly), false, 'Returns a boolean');

    equal(_.matcher({__x__: undefined})(5), false, 'can match undefined props on primitives');
    equal(_.matcher({__x__: undefined})({__x__: undefined}), true, 'can match undefined props');

    equal(_.matcher({})(null), true, 'Empty spec called with null object returns true');
    equal(_.matcher({a: 1})(null), false, 'Non-empty spec called with null object returns false');

    ok(_.find(stooges, _.matcher({hair: false})) === curly, 'returns a predicate that can be used by finding functions.');
    ok(_.find(stooges, _.matcher(moe)) === moe, 'can be used to locate an object exists in a collection.');
    deepEqual(_.where([null, undefined], {a: 1}), [], 'Do not throw on null values.');

    deepEqual(_.where([null, undefined], null), [null, undefined], 'null matches null');
    deepEqual(_.where([null, undefined], {}), [null, undefined], 'null matches {}');
    deepEqual(_.where([{b: 1}], {a: undefined}), [], 'handles undefined values (1683)');

    _.each([true, 5, NaN, null, undefined], function(item) {
      deepEqual(_.where([{a: 1}], item), [{a: 1}], 'treats primitives as empty');
    });

    function Prototest() {}
    Prototest.prototype.x = 1;
    var specObj = new Prototest;
    var protospec = _.matcher(specObj);
    equal(protospec({x: 2}), true, 'spec is restricted to own properties');

    specObj.y = 5;
    protospec = _.matcher(specObj);
    equal(protospec({x: 1, y: 5}), true);
    equal(protospec({x: 1, y: 4}), false);

    ok(_.matcher({x: 1, y: 5})(specObj), 'inherited and own properties are checked on the test object');

    Prototest.x = 5;
    ok(_.matcher(Prototest)({x: 5, y: 1}), 'spec can be a function');

    // #1729
    var o = {'b': 1};
    var m = _.matcher(o);

    equal(m({'b': 1}), true);
    o.b = 2;
    o.a = 1;
    equal(m({'b': 1}), true, 'changing spec object doesnt change matches result');


    //null edge cases
    var oCon = _.matcher({'constructor': Object});
    deepEqual(_.map([null, undefined, 5, {}], oCon), [false, false, false, true], 'doesnt falsey match constructor on undefined/null');
  });

  test('matcher', function() {
    var moe = {name: 'Moe Howard', hair: true};
    var curly = {name: 'Curly Howard', hair: false};
    var stooges = [moe, curly];

    equal(_.matcher({hair: true})(moe), true, 'Returns a boolean');
    equal(_.matcher({hair: true})(curly), false, 'Returns a boolean');

    equal(_.matcher({__x__: undefined})(5), false, 'can match undefined props on primitives');
    equal(_.matcher({__x__: undefined})({__x__: undefined}), true, 'can match undefined props');

    equal(_.matcher({})(null), true, 'Empty spec called with null object returns true');
    equal(_.matcher({a: 1})(null), false, 'Non-empty spec called with null object returns false');

    ok(_.find(stooges, _.matcher({hair: false})) === curly, 'returns a predicate that can be used by finding functions.');
    ok(_.find(stooges, _.matcher(moe)) === moe, 'can be used to locate an object exists in a collection.');
    deepEqual(_.where([null, undefined], {a: 1}), [], 'Do not throw on null values.');

    deepEqual(_.where([null, undefined], null), [null, undefined], 'null matches null');
    deepEqual(_.where([null, undefined], {}), [null, undefined], 'null matches {}');
    deepEqual(_.where([{b: 1}], {a: undefined}), [], 'handles undefined values (1683)');

    _.each([true, 5, NaN, null, undefined], function(item) {
      deepEqual(_.where([{a: 1}], item), [{a: 1}], 'treats primitives as empty');
    });

    function Prototest() {}
    Prototest.prototype.x = 1;
    var specObj = new Prototest;
    var protospec = _.matcher(specObj);
    equal(protospec({x: 2}), true, 'spec is restricted to own properties');

    specObj.y = 5;
    protospec = _.matcher(specObj);
    equal(protospec({x: 1, y: 5}), true);
    equal(protospec({x: 1, y: 4}), false);

    ok(_.matcher({x: 1, y: 5})(specObj), 'inherited and own properties are checked on the test object');

    Prototest.x = 5;
    ok(_.matcher(Prototest)({x: 5, y: 1}), 'spec can be a function');

    // #1729
    var o = {'b': 1};
    var m = _.matcher(o);

    equal(m({'b': 1}), true);
    o.b = 2;
    o.a = 1;
    equal(m({'b': 1}), true, 'changing spec object doesnt change matches result');


    //null edge cases
    var oCon = _.matcher({'constructor': Object});
    deepEqual(_.map([null, undefined, 5, {}], oCon), [false, false, false, true], 'doesnt falsey match constructor on undefined/null');
  });

  test('findKey', function() {
    var objects = {
      a: {'a': 0, 'b': 0},
      b: {'a': 1, 'b': 1},
      c: {'a': 2, 'b': 2}
    };

    equal(_.findKey(objects, function(obj) {
      return obj.a === 0;
    }), 'a');

    equal(_.findKey(objects, function(obj) {
      return obj.b * obj.a === 4;
    }), 'c');

    equal(_.findKey(objects, 'a'), 'b', 'Uses lookupIterator');

    equal(_.findKey(objects, function(obj) {
      return obj.b * obj.a === 5;
    }), undefined);

    strictEqual(_.findKey([1, 2, 3, 4, 5, 6], function(obj) {
      return obj === 3;
    }), '2', 'Keys are strings');

    strictEqual(_.findKey(objects, function(a) {
      return a.foo === null;
    }), undefined);

    _.findKey({a: {a: 1}}, function(a, key, obj) {
      equal(key, 'a');
      deepEqual(obj, {a: {a: 1}});
      strictEqual(this, objects, 'called with context');
    }, objects);

    var array = [1, 2, 3, 4];
    array.match = 55;
    strictEqual(_.findKey(array, function(x) { return x === 55; }), 'match', 'matches array-likes keys');
  });


  test('mapObject', function() {
   var obj = {'a': 1, 'b': 2};
   var objects = {
      a: {'a': 0, 'b': 0},
      b: {'a': 1, 'b': 1},
      c: {'a': 2, 'b': 2}
    };

    deepEqual(_.mapObject(obj, function(val) {
      return val * 2;
    }), {'a': 2, 'b': 4}, 'simple objects');

    deepEqual(_.mapObject(objects, function(val) {
      return _.reduce(val, function(memo,v){
       return memo + v;
      },0);
    }), {'a': 0, 'b': 2, 'c': 4}, 'nested objects');

    deepEqual(_.mapObject(obj, function(val,key,obj) {
      return obj[key] * 2;
    }), {'a': 2, 'b': 4}, 'correct keys');

    deepEqual(_.mapObject([1,2], function(val) {
      return val * 2;
    }), {'0': 2, '1': 4}, 'check behavior for arrays');

    deepEqual(_.mapObject(obj, function(val) {
      return val * this.multiplier;
    }, {multiplier : 3}), {'a': 3, 'b': 6}, 'keep context');

    deepEqual(_.mapObject({a: 1}, function() {
      return this.length;
    }, [1,2]), {'a': 2}, 'called with context');

    var ids = _.mapObject({length: 2, 0: {id: '1'}, 1: {id: '2'}}, function(n){
      return n.id;
    });
    deepEqual(ids, {'length': undefined, '0': '1', '1': '2'}, 'Check with array-like objects');

    // Passing a property name like _.pluck.
    var people = {'a': {name : 'moe', age : 30}, 'b': {name : 'curly', age : 50}};
    deepEqual(_.mapObject(people, 'name'), {'a': 'moe', 'b': 'curly'}, 'predicate string map to object properties');

    _.each([null, void 0, 1, 'abc', [], {}, undefined], function(val){
      deepEqual(_.mapObject(val, _.identity), {}, 'mapValue identity');
    });

    var Proto = function(){this.a = 1;};
    Proto.prototype.b = 1;
    var protoObj = new Proto();
    deepEqual(_.mapObject(protoObj, _.identity), {a: 1}, 'ignore inherited values from prototypes');

  });
}());


(function() {
  var _ = typeof require == 'function' ? require('..') : this._;
  var templateSettings;

  QUnit.module('Utility', {

    setup: function() {
      templateSettings = _.clone(_.templateSettings);
    },

    teardown: function() {
      _.templateSettings = templateSettings;
    }

  });

  test('#750 - Return _ instance.', 2, function() {
    var instance = _([]);
    ok(_(instance) === instance);
    ok(new _(instance) === instance);
  });

  test('identity', function() {
    var stooge = {name : 'moe'};
    equal(_.identity(stooge), stooge, 'stooge is the same as his identity');
  });

  test('constant', function() {
    var stooge = {name : 'moe'};
    equal(_.constant(stooge)(), stooge, 'should create a function that returns stooge');
  });

  test('noop', function() {
    strictEqual(_.noop('curly', 'larry', 'moe'), undefined, 'should always return undefined');
  });

  test('property', function() {
    var stooge = {name : 'moe'};
    equal(_.property('name')(stooge), 'moe', 'should return the property with the given name');
    equal(_.property('name')(null), undefined, 'should return undefined for null values');
    equal(_.property('name')(undefined), undefined, 'should return undefined for undefined values');
  });
  
  test('propertyOf', function() {
    var stoogeRanks = _.propertyOf({curly: 2, moe: 1, larry: 3});
    equal(stoogeRanks('curly'), 2, 'should return the property with the given name');
    equal(stoogeRanks(null), undefined, 'should return undefined for null values');
    equal(stoogeRanks(undefined), undefined, 'should return undefined for undefined values');
    
    function MoreStooges() { this.shemp = 87; }
    MoreStooges.prototype = {curly: 2, moe: 1, larry: 3};
    var moreStoogeRanks = _.propertyOf(new MoreStooges());
    equal(moreStoogeRanks('curly'), 2, 'should return properties from further up the prototype chain');
    
    var nullPropertyOf = _.propertyOf(null);
    equal(nullPropertyOf('curly'), undefined, 'should return undefined when obj is null');
    
    var undefPropertyOf = _.propertyOf(undefined);
    equal(undefPropertyOf('curly'), undefined, 'should return undefined when obj is undefined');
  });

  test('random', function() {
    var array = _.range(1000);
    var min = Math.pow(2, 31);
    var max = Math.pow(2, 62);

    ok(_.every(array, function() {
      return _.random(min, max) >= min;
    }), 'should produce a random number greater than or equal to the minimum number');

    ok(_.some(array, function() {
      return _.random(Number.MAX_VALUE) > 0;
    }), 'should produce a random number when passed `Number.MAX_VALUE`');
  });

  test('now', function() {
    var diff = _.now() - new Date().getTime();
    ok(diff <= 0 && diff > -5, 'Produces the correct time in milliseconds');//within 5ms
  });

  test('uniqueId', function() {
    var ids = [], i = 0;
    while (i++ < 100) ids.push(_.uniqueId());
    equal(_.uniq(ids).length, ids.length, 'can generate a globally-unique stream of ids');
  });

  test('times', function() {
    var vals = [];
    _.times(3, function (i) { vals.push(i); });
    deepEqual(vals, [0, 1, 2], 'is 0 indexed');
    //
    vals = [];
    _(3).times(function(i) { vals.push(i); });
    deepEqual(vals, [0, 1, 2], 'works as a wrapper');
    // collects return values
    deepEqual([0, 1, 2], _.times(3, function(i) { return i; }), 'collects return values');

    deepEqual(_.times(0, _.identity), []);
    deepEqual(_.times(-1, _.identity), []);
    deepEqual(_.times(parseFloat('-Infinity'), _.identity), []);
  });

  test('mixin', function() {
    _.mixin({
      myReverse: function(string) {
        return string.split('').reverse().join('');
      }
    });
    equal(_.myReverse('panacea'), 'aecanap', 'mixed in a function to _');
    equal(_('champ').myReverse(), 'pmahc', 'mixed in a function to the OOP wrapper');
  });

  test('_.escape', function() {
    equal(_.escape(null), '');
  });

  test('_.unescape', function() {
    var string = 'Curly & Moe';
    equal(_.unescape(null), '');
    equal(_.unescape(_.escape(string)), string);
    equal(_.unescape(string), string, 'don\'t unescape unnecessarily');
  });

  // Don't care what they escape them to just that they're escaped and can be unescaped
  test('_.escape & unescape', function() {
    // test & (&amp;) seperately obviously
    var escapeCharacters = ['<', '>', '"', '\'', '`'];

    _.each(escapeCharacters, function(escapeChar) {
      var str = 'a ' + escapeChar + ' string escaped';
      var escaped = _.escape(str);
      notEqual(str, escaped, escapeChar + ' is escaped');
      equal(str, _.unescape(escaped), escapeChar + ' can be unescaped');

      str = 'a ' + escapeChar + escapeChar + escapeChar + 'some more string' + escapeChar;
      escaped = _.escape(str);

      equal(escaped.indexOf(escapeChar), -1, 'can escape multiple occurances of ' + escapeChar);
      equal(_.unescape(escaped), str, 'multiple occurrences of ' + escapeChar + ' can be unescaped');
    });

    // handles multiple escape characters at once
    var joiner = ' other stuff ';
    var allEscaped = escapeCharacters.join(joiner);
    allEscaped += allEscaped;
    ok(_.every(escapeCharacters, function(escapeChar) {
      return allEscaped.indexOf(escapeChar) !== -1;
    }), 'handles multiple characters');
    ok(allEscaped.indexOf(joiner) >= 0, 'can escape multiple escape characters at the same time');

    // test & -> &amp;
    var str = 'some string & another string & yet another';
    var escaped = _.escape(str);

    ok(escaped.indexOf('&') !== -1, 'handles & aka &amp;');
    equal(_.unescape(str), str, 'can unescape &amp;');
  });

  test('template', function() {
    var basicTemplate = _.template("<%= thing %> is gettin' on my noives!");
    var result = basicTemplate({thing : 'This'});
    equal(result, "This is gettin' on my noives!", 'can do basic attribute interpolation');

    var sansSemicolonTemplate = _.template('A <% this %> B');
    equal(sansSemicolonTemplate(), 'A  B');

    var backslashTemplate = _.template('<%= thing %> is \\ridanculous');
    equal(backslashTemplate({thing: 'This'}), 'This is \\ridanculous');

    var escapeTemplate = _.template('<%= a ? "checked=\\"checked\\"" : "" %>');
    equal(escapeTemplate({a: true}), 'checked="checked"', 'can handle slash escapes in interpolations.');

    var fancyTemplate = _.template('<ul><% ' +
    '  for (var key in people) { ' +
    '%><li><%= people[key] %></li><% } %></ul>');
    result = fancyTemplate({people : {moe : 'Moe', larry : 'Larry', curly : 'Curly'}});
    equal(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var escapedCharsInJavascriptTemplate = _.template('<ul><% _.each(numbers.split("\\n"), function(item) { %><li><%= item %></li><% }) %></ul>');
    result = escapedCharsInJavascriptTemplate({numbers: 'one\ntwo\nthree\nfour'});
    equal(result, '<ul><li>one</li><li>two</li><li>three</li><li>four</li></ul>', 'Can use escaped characters (e.g. \\n) in JavaScript');

    var namespaceCollisionTemplate = _.template('<%= pageCount %> <%= thumbnails[pageCount] %> <% _.each(thumbnails, function(p) { %><div class="thumbnail" rel="<%= p %>"></div><% }); %>');
    result = namespaceCollisionTemplate({
      pageCount: 3,
      thumbnails: {
        1: 'p1-thumbnail.gif',
        2: 'p2-thumbnail.gif',
        3: 'p3-thumbnail.gif'
      }
    });
    equal(result, '3 p3-thumbnail.gif <div class="thumbnail" rel="p1-thumbnail.gif"></div><div class="thumbnail" rel="p2-thumbnail.gif"></div><div class="thumbnail" rel="p3-thumbnail.gif"></div>');

    var noInterpolateTemplate = _.template('<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>');
    result = noInterpolateTemplate();
    equal(result, '<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>');

    var quoteTemplate = _.template("It's its, not it's");
    equal(quoteTemplate({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template('<% ' +
    "  if(foo == 'bar'){ " +
    "%>Statement quotes and 'quotes'.<% } %>");
    equal(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    var withNewlinesAndTabs = _.template('This\n\t\tis: <%= x %>.\n\tok.\nend.');
    equal(withNewlinesAndTabs({x: 'that'}), 'This\n\t\tis: that.\n\tok.\nend.');

    var template = _.template('<i><%- value %></i>');
    result = template({value: '<script>'});
    equal(result, '<i>&lt;script&gt;</i>');

    var stooge = {
      name: 'Moe',
      template: _.template("I'm <%= this.name %>")
    };
    equal(stooge.template(), "I'm Moe");

    template = _.template('\n ' +
    '  <%\n ' +
    '  // a comment\n ' +
    '  if (data) { data += 12345; }; %>\n ' +
    '  <li><%= data %></li>\n '
    );
    equal(template({data : 12345}).replace(/\s/g, ''), '<li>24690</li>');

    _.templateSettings = {
      evaluate    : /\{\{([\s\S]+?)\}\}/g,
      interpolate : /\{\{=([\s\S]+?)\}\}/g
    };

    var custom = _.template('<ul>{{ for (var key in people) { }}<li>{{= people[key] }}</li>{{ } }}</ul>');
    result = custom({people : {moe : 'Moe', larry : 'Larry', curly : 'Curly'}});
    equal(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var customQuote = _.template("It's its, not it's");
    equal(customQuote({}), "It's its, not it's");

    quoteInStatementAndBody = _.template("{{ if(foo == 'bar'){ }}Statement quotes and 'quotes'.{{ } }}");
    equal(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      evaluate    : /<\?([\s\S]+?)\?>/g,
      interpolate : /<\?=([\s\S]+?)\?>/g
    };

    var customWithSpecialChars = _.template('<ul><? for (var key in people) { ?><li><?= people[key] ?></li><? } ?></ul>');
    result = customWithSpecialChars({people : {moe : 'Moe', larry : 'Larry', curly : 'Curly'}});
    equal(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var customWithSpecialCharsQuote = _.template("It's its, not it's");
    equal(customWithSpecialCharsQuote({}), "It's its, not it's");

    quoteInStatementAndBody = _.template("<? if(foo == 'bar'){ ?>Statement quotes and 'quotes'.<? } ?>");
    equal(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
    };

    var mustache = _.template('Hello {{planet}}!');
    equal(mustache({planet : 'World'}), 'Hello World!', 'can mimic mustache.js');

    var templateWithNull = _.template('a null undefined {{planet}}');
    equal(templateWithNull({planet : 'world'}), 'a null undefined world', 'can handle missing escape and evaluate settings');
  });

  test('_.template provides the generated function source, when a SyntaxError occurs', function() {
    try {
      _.template('<b><%= if x %></b>');
    } catch (ex) {
      var source = ex.source;
    }
    ok(/__p/.test(source));
  });

  test('_.template handles \\u2028 & \\u2029', function() {
    var tmpl = _.template('<p>\u2028<%= "\\u2028\\u2029" %>\u2029</p>');
    strictEqual(tmpl(), '<p>\u2028\u2028\u2029\u2029</p>');
  });

  test('result calls functions and returns primitives', function() {
    var obj = {w: '', x: 'x', y: function(){ return this.x; }};
    strictEqual(_.result(obj, 'w'), '');
    strictEqual(_.result(obj, 'x'), 'x');
    strictEqual(_.result(obj, 'y'), 'x');
    strictEqual(_.result(obj, 'z'), undefined);
    strictEqual(_.result(null, 'x'), undefined);
  });

  test('result returns a default value if object is null or undefined', function() {
    strictEqual(_.result(null, 'b', 'default'), 'default');
    strictEqual(_.result(undefined, 'c', 'default'), 'default');
    strictEqual(_.result(''.match('missing'), 1, 'default'), 'default');
  });

  test('result returns a default value if property of object is missing', function() {
    strictEqual(_.result({d: null}, 'd', 'default'), null);
    strictEqual(_.result({e: false}, 'e', 'default'), false);
  });

  test('result only returns the default value if the object does not have the property or is undefined', function() {
    strictEqual(_.result({}, 'b', 'default'), 'default');
    strictEqual(_.result({d: undefined}, 'd', 'default'), 'default');
  });

  test('result does not return the default if the property of an object is found in the prototype', function() {
    var Foo = function(){};
    Foo.prototype.bar = 1;
    strictEqual(_.result(new Foo, 'bar', 2), 1);
  });

  test('result does use the fallback when the result of invoking the property is undefined', function() {
    var obj = {a: function() {}};
    strictEqual(_.result(obj, 'a', 'failed'), undefined);
  });

  test('result fallback can use a function', function() {
    var obj = {a: [1, 2, 3]};
    strictEqual(_.result(obj, 'b', _.constant(5)), 5);
    strictEqual(_.result(obj, 'b', function() {
      return this.a;
    }), obj.a, 'called with context');
  });

  test('_.templateSettings.variable', function() {
    var s = '<%=data.x%>';
    var data = {x: 'x'};
    var tmp = _.template(s, {variable: 'data'});
    strictEqual(tmp(data), 'x');
    _.templateSettings.variable = 'data';
    strictEqual(_.template(s)(data), 'x');
  });

  test('#547 - _.templateSettings is unchanged by custom settings.', function() {
    ok(!_.templateSettings.variable);
    _.template('', {}, {variable: 'x'});
    ok(!_.templateSettings.variable);
  });

  test('#556 - undefined template variables.', function() {
    var template = _.template('<%=x%>');
    strictEqual(template({x: null}), '');
    strictEqual(template({x: undefined}), '');

    var templateEscaped = _.template('<%-x%>');
    strictEqual(templateEscaped({x: null}), '');
    strictEqual(templateEscaped({x: undefined}), '');

    var templateWithProperty = _.template('<%=x.foo%>');
    strictEqual(templateWithProperty({x: {}}), '');
    strictEqual(templateWithProperty({x: {}}), '');

    var templateWithPropertyEscaped = _.template('<%-x.foo%>');
    strictEqual(templateWithPropertyEscaped({x: {}}), '');
    strictEqual(templateWithPropertyEscaped({x: {}}), '');
  });

  test('interpolate evaluates code only once.', 2, function() {
    var count = 0;
    var template = _.template('<%= f() %>');
    template({f: function(){ ok(!count++); }});

    var countEscaped = 0;
    var templateEscaped = _.template('<%- f() %>');
    templateEscaped({f: function(){ ok(!countEscaped++); }});
  });

  test('#746 - _.template settings are not modified.', 1, function() {
    var settings = {};
    _.template('', null, settings);
    deepEqual(settings, {});
  });

  test('#779 - delimeters are applied to unescaped text.', 1, function() {
    var template = _.template('<<\nx\n>>', null, {evaluate: /<<(.*?)>>/g});
    strictEqual(template(), '<<\nx\n>>');
  });

}());

