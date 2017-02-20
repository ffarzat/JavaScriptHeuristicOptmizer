(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.moment = factory();
}(this, function () {
    'use strict';
    var hookCallback;
    function utils_hooks__hooks() {
        return hookCallback.apply(null, arguments);
    }
    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }
    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }
    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }
    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }
    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }
        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }
        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }
        return a;
    }
    function create_utc__createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }
    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false
        };
    }
    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }
    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.invalidWeekday && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated;
            if (m._strict) {
                m._isValid = m._isValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }
    function valid__createInvalid(flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }
        return m;
    }
    var momentProperties = utils_hooks__hooks.momentProperties = [];
    function copyConfig(to, from) {
        var i, prop, val;
        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = getParsingFlags(from);
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }
        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }
        return to;
    }
    var updateInProgress = false;
    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }
    function isMoment(obj) {
        return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
    }
    function absFloor(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }
    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion, value = 0;
        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }
        return value;
    }
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
        for (i = 0; i < len; i++) {
            if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }
    function Locale() {
    }
    var locales = {};
    var globalLocale;
    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }
    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;
        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }
    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && typeof module !== 'undefined' && module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                ;
            } catch (e) {
            }
        }
        return locales[name];
    }
    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (typeof values === 'undefined') {
                data = locale_locales__getLocale(key);
            } else {
                data = defineLocale(key, values);
            }
            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }
        return globalLocale._abbr;
    }
    function defineLocale(name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);
            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);
            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }
    // returns locale data
    function locale_locales__getLocale(key) {
        var locale;
        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }
        if (!key) {
            return globalLocale;
        }
        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }
        return chooseLocale(key);
    }
    var aliases = {};
    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }
    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }
    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {}, normalizedProp, prop;
        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }
        return normalizedInput;
    }
    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }
    function get_set__get(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }
    function get_set__set(mom, unit, value) {
        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }
    // MOMENTS
    function getSet(units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                return this[units](value);
            }
        }
        return this;
    }
    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number), zerosToFill = targetLength - absNumber.length, sign = number >= 0;
        return (sign ? forceSign ? '+' : '' : '-') + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }
    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
    var formatFunctions = {};
    var formatTokenFunctions = {};
    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }
    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }
    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;
        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }
        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }
    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }
        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
        return formatFunctions[format](m);
    }
    function expandFormat(format, locale) {
        var i = 5;
        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    }
    var match1 = /\d/;
    //       0 - 9
    var match2 = /\d\d/;
    //      00 - 99
    var match3 = /\d{3}/;
    //     000 - 999
    var match4 = /\d{4}/;
    //    0000 - 9999
    var match6 = /[+-]?\d{6}/;
    // -999999 - 999999
    var match1to2 = /\d\d?/;
    //       0 - 99
    var match1to3 = /\d{1,3}/;
    //       0 - 999
    var match1to4 = /\d{1,4}/;
    //       0 - 9999
    var match1to6 = /[+-]?\d{1,6}/;
    // -999999 - 999999
    var matchUnsigned = /\d+/;
    //       0 - inf
    var matchSigned = /[+-]?\d+/;
    //    -inf - inf
    var matchOffset = /Z|[+-]\d\d:?\d\d/gi;
    // +00:00 -00:00 +0000 -0000 or Z
    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/;
    // 123456789 123456789.123
    // any word (or two) characters or numbers including two/three word month in arabic.
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
    var regexes = {};
    function isFunction(sth) {
        // https://github.com/moment/moment/issues/2325
        return typeof sth === 'function' && Object.prototype.toString.call(sth) === '[object Function]';
    }
    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
            return isStrict && strictRegex ? strictRegex : regex;
        };
    }
    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }
        return regexes[token](config._strict, config._locale);
    }
    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    var tokens = {};
    function addParseToken(token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }
    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }
    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }
    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    // FORMATTING
    addFormatToken('M', [
        'MM',
        2
    ], 'Mo', function () {
        return this.month() + 1;
    });
    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });
    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });
    // ALIASES
    addUnitAlias('month', 'M');
    // PARSING
    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', matchWord);
    addRegexToken('MMMM', matchWord);
    addParseToken([
        'M',
        'MM'
    ], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });
    addParseToken([
        'MMM',
        'MMMM'
    ], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });
    // LOCALES
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths(m) {
        return this._months[m.month()];
    }
    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort(m) {
        return this._monthsShort[m.month()];
    }
    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;
        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([
                2000,
                i
            ]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }
    // MOMENTS
    function setMonth(mom, value) {
        var dayOfMonth;
        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }
        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }
    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }
    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }
    function checkOverflow(m) {
        var overflow;
        var a = m._a;
        if (a && getParsingFlags(m).overflow === -2) {
            overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            getParsingFlags(m).overflow = overflow;
        }
        return m;
    }
    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }
    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                ;
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }
    var deprecations = {};
    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }
    utils_hooks__hooks.suppressDeprecationWarnings = false;
    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var isoDates = [
            [
                'YYYYYY-MM-DD',
                /[+-]\d{6}-\d{2}-\d{2}/
            ],
            [
                'YYYY-MM-DD',
                /\d{4}-\d{2}-\d{2}/
            ],
            [
                'GGGG-[W]WW-E',
                /\d{4}-W\d{2}-\d/
            ],
            [
                'GGGG-[W]WW',
                /\d{4}-W\d{2}/
            ],
            [
                'YYYY-DDD',
                /\d{4}-\d{3}/
            ]
        ];
    // iso time formats and regexes
    var isoTimes = [
            [
                'HH:mm:ss.SSSS',
                /(T| )\d\d:\d\d:\d\d\.\d+/
            ],
            [
                'HH:mm:ss',
                /(T| )\d\d:\d\d:\d\d/
            ],
            [
                'HH:mm',
                /(T| )\d\d:\d\d/
            ],
            [
                'HH',
                /(T| )\d\d/
            ]
        ];
    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
    // date from iso format
    function configFromISO(config) {
        var i, l, string = config._i, match = from_string__isoRegex.exec(string);
        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0];
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    // match[6] should be 'T' or space
                    config._f += (match[6] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (string.match(matchOffset)) {
                config._f += 'Z';
            }
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }
    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }
        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }
    utils_hooks__hooks.createFromInputFallback = deprecate('moment construction falls back to js Date. This is ' + 'discouraged and will be removed in upcoming major ' + 'release. Please refer to ' + 'https://github.com/moment/moment/issues/1407 for more info.', function (config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
    });
    function createDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);
        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }
    function createUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }
    addFormatToken(0, [
        'YY',
        2
    ], 0, function () {
        return this.year() % 100;
    });
    addFormatToken(0, [
        'YYYY',
        4
    ], 0, 'year');
    addFormatToken(0, [
        'YYYYY',
        5
    ], 0, 'year');
    addFormatToken(0, [
        'YYYYYY',
        6,
        true
    ], 0, 'year');
    // ALIASES
    addUnitAlias('year', 'y');
    // PARSING
    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);
    addParseToken([
        'YYYYY',
        'YYYYYY'
    ], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    // HELPERS
    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }
    // HOOKS
    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };
    // MOMENTS
    var getSetYear = makeGetSet('FullYear', false);
    function getIsLeapYear() {
        return isLeapYear(this.year());
    }
    addFormatToken('w', [
        'ww',
        2
    ], 'wo', 'week');
    addFormatToken('W', [
        'WW',
        2
    ], 'Wo', 'isoWeek');
    // ALIASES
    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');
    // PARSING
    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);
    addWeekParseToken([
        'w',
        'ww',
        'W',
        'WW'
    ], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });
    // HELPERS
    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }
        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }
        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }
    // LOCALES
    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }
    var defaultLocaleWeek = {
            dow: 0,
            doy: 6
        };
    function localeFirstDayOfWeek() {
        return this._week.dow;
    }
    function localeFirstDayOfYear() {
        return this._week.doy;
    }
    // MOMENTS
    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }
    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }
    addFormatToken('DDD', [
        'DDDD',
        3
    ], 'DDDo', 'dayOfYear');
    // ALIASES
    addUnitAlias('dayOfYear', 'DDD');
    // PARSING
    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken([
        'DDD',
        'DDDD'
    ], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });
    // HELPERS
    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
        if (d < firstDayOfWeek) {
            d += 7;
        }
        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;
        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;
        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }
    // MOMENTS
    function getSetDayOfYear(input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 86400000) + 1;
        return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
    }
    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }
    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        }
        return [
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        ];
    }
    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i, date, input = [], currentDate, yearToUse;
        if (config._d) {
            return;
        }
        currentDate = currentDateArray(config);
        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }
        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }
            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }
        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }
        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
        }
        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }
        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }
        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }
    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;
        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;
            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;
            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);
            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }
    utils_hooks__hooks.ISO_8601 = function () {
    };
    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }
        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }
        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true && config._a[HOUR] <= 12 && config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
        configFromArray(config);
        checkOverflow(config);
    }
    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;
        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }
    function configFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }
        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);
            if (!valid__isValid(tempConfig)) {
                continue;
            }
            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;
            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
            getParsingFlags(tempConfig).score = currentScore;
            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }
        extend(config, bestMoment || tempConfig);
    }
    function configFromObject(config) {
        if (config._d) {
            return;
        }
        var i = normalizeObjectUnits(config._i);
        config._a = [
            i.year,
            i.month,
            i.day || i.date,
            i.hour,
            i.minute,
            i.second,
            i.millisecond
        ];
        configFromArray(config);
    }
    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }
        return res;
    }
    function prepareConfig(config) {
        var input = config._i, format = config._f;
        config._locale = config._locale || locale_locales__getLocale(config._l);
        if (input === null || format === undefined && input === '') {
            return valid__createInvalid({ nullInput: true });
        }
        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }
        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }
        return config;
    }
    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof input === 'object') {
            configFromObject(config);
        } else if (typeof input === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }
    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};
        if (typeof locale === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        return createFromConfig(c);
    }
    function local__createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }
    var prototypeMin = deprecate('moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548', function () {
            var other = local__createLocal.apply(null, arguments);
            return other < this ? this : other;
        });
    var prototypeMax = deprecate('moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548', function () {
            var other = local__createLocal.apply(null, arguments);
            return other > this ? this : other;
        });
    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }
    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);
        return pickBy('isBefore', args);
    }
    function max() {
        var args = [].slice.call(arguments, 0);
        return pickBy('isAfter', args);
    }
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
        // representation for dateAddRemove
        this._milliseconds = +milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
        // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days + weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months + quarters * 3 + years * 12;
        this._data = {};
        this._locale = locale_locales__getLocale();
        this._bubble();
    }
    function isDuration(obj) {
        return obj instanceof Duration;
    }
    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~offset % 60, 2);
        });
    }
    offset('Z', ':');
    offset('ZZ', '');
    // PARSING
    addRegexToken('Z', matchOffset);
    addRegexToken('ZZ', matchOffset);
    addParseToken([
        'Z',
        'ZZ'
    ], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(input);
    });
    // HELPERS
    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;
    function offsetFromString(string) {
        var matches = (string || '').match(matchOffset) || [];
        var chunk = matches[matches.length - 1] || [];
        var parts = (chunk + '').match(chunkOffset) || [
                '-',
                0,
                0
            ];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);
        return parts[0] === '+' ? minutes : -minutes;
    }
    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - +res;
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }
    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }
    // HOOKS
    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {
    };
    // MOMENTS
    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime) {
        var offset = this._offset || 0, localAdjust;
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(input);
            }
            if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }
    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }
            this.utcOffset(input, keepLocalTime);
            return this;
        } else {
            return -this.utcOffset();
        }
    }
    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }
    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;
            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }
    function setOffsetToParsedOffset() {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(this._i));
        }
        return this;
    }
    function hasAlignedHourOffset(input) {
        input = input ? local__createLocal(input).utcOffset() : 0;
        return (this.utcOffset() - input) % 60 === 0;
    }
    function isDaylightSavingTime() {
        return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
    }
    function isDaylightSavingTimeShifted() {
        if (typeof this._isDSTShifted !== 'undefined') {
            return this._isDSTShifted;
        }
        var c = {};
        copyConfig(c, this);
        c = prepareConfig(c);
        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }
        return this._isDSTShifted;
    }
    function isLocal() {
        return !this._isUTC;
    }
    function isUtcOffset() {
        return this._isUTC;
    }
    function isUtc() {
        return this._isUTC && this._offset === 0;
    }
    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;
    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
    function create__createDuration(input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null, sign, ret, diffRes;
        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = create__isoRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                d: parseIso(match[4], sign),
                h: parseIso(match[5], sign),
                m: parseIso(match[6], sign),
                s: parseIso(match[7], sign),
                w: parseIso(match[8], sign)
            };
        } else if (duration == null) {
            // checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));
            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }
        ret = new Duration(duration);
        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }
        return ret;
    }
    create__createDuration.fn = Duration.prototype;
    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }
    function positiveMomentsDifference(base, other) {
        var res = {
                milliseconds: 0,
                months: 0
            };
        res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }
        res.milliseconds = +other - +base.clone().add(res.months, 'M');
        return res;
    }
    function momentsDifference(base, other) {
        var res;
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }
        return res;
    }
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val;
                val = period;
                period = tmp;
            }
            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }
    function add_subtract__addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;
        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }
    var add_subtract__add = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');
    function moment_calendar__calendar(time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(), sod = cloneWithOffset(now, this).startOf('day'), diff = this.diff(sod, 'days', true), format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
    }
    function clone() {
        return new Moment(this);
    }
    function isAfter(input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this > +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return inputMs < +this.clone().startOf(units);
        }
    }
    function isBefore(input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this < +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return +this.clone().endOf(units) < inputMs;
        }
    }
    function isBetween(from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }
    function isSame(input, units) {
        var inputMs;
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this === +input;
        } else {
            inputMs = +local__createLocal(input);
            return +this.clone().startOf(units) <= inputMs && inputMs <= +this.clone().endOf(units);
        }
    }
    function diff(input, units, asFloat) {
        var that = cloneWithOffset(input, this), zoneDelta = (that.utcOffset() - this.utcOffset()) * 60000, delta, output;
        units = normalizeUnits(units);
        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1000 : units === 'minute' ? delta / 60000 : units === 'hour' ? delta / 3600000 : units === 'day' ? (delta - zoneDelta) / 86400000 : units === 'week' ? (delta - zoneDelta) / 604800000 : delta;
        }
        return asFloat ? output : absFloor(output);
    }
    function monthDiff(a, b) {
        // difference in months
        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'), anchor2, adjust;
        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }
        return -(wholeMonthDiff + adjust);
    }
    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }
    function moment_format__toISOString() {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if ('function' === typeof Date.prototype.toISOString) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }
    function moment_format__format(inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }
    function from(time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({
            to: this,
            from: time
        }).locale(this.locale()).humanize(!withoutSuffix);
    }
    function fromNow(withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }
    function to(time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({
            from: this,
            to: time
        }).locale(this.locale()).humanize(!withoutSuffix);
    }
    function toNow(withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }
    function locale(key) {
        var newLocaleData;
        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }
    var lang = deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        });
    function localeData() {
        return this._locale;
    }
    function startOf(units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
        /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
        /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
        /* falls through */
        case 'hour':
            this.minutes(0);
        /* falls through */
        case 'minute':
            this.seconds(0);
        /* falls through */
        case 'second':
            this.milliseconds(0);
        }
        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }
        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }
        return this;
    }
    function endOf(units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, units === 'isoWeek' ? 'week' : units).subtract(1, 'ms');
    }
    function to_type__valueOf() {
        return +this._d - (this._offset || 0) * 60000;
    }
    function unix() {
        return Math.floor(+this / 1000);
    }
    function toDate() {
        return this._offset ? new Date(+this) : this._d;
    }
    function toArray() {
        var m = this;
        return [
            m.year(),
            m.month(),
            m.date(),
            m.hour(),
            m.minute(),
            m.second(),
            m.millisecond()
        ];
    }
    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }
    function moment_valid__isValid() {
        return valid__isValid(this);
    }
    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }
    function invalidAt() {
        return getParsingFlags(this).overflow;
    }
    addFormatToken(0, [
        'gg',
        2
    ], 0, function () {
        return this.weekYear() % 100;
    });
    addFormatToken(0, [
        'GG',
        2
    ], 0, function () {
        return this.isoWeekYear() % 100;
    });
    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [
            token,
            token.length
        ], 0, getter);
    }
    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');
    // ALIASES
    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');
    // PARSING
    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);
    addWeekParseToken([
        'gggg',
        'ggggg',
        'GGGG',
        'GGGGG'
    ], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });
    addWeekParseToken([
        'gg',
        'GG'
    ], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    // HELPERS
    function weeksInYear(year, dow, doy) {
        return weekOfYear(local__createLocal([
            year,
            11,
            31 + dow - doy
        ]), dow, doy).week;
    }
    // MOMENTS
    function getSetWeekYear(input) {
        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
        return input == null ? year : this.add(input - year, 'y');
    }
    function getSetISOWeekYear(input) {
        var year = weekOfYear(this, 1, 4).year;
        return input == null ? year : this.add(input - year, 'y');
    }
    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }
    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }
    addFormatToken('Q', 0, 0, 'quarter');
    // ALIASES
    addUnitAlias('quarter', 'Q');
    // PARSING
    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });
    // MOMENTS
    function getSetQuarter(input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }
    addFormatToken('D', [
        'DD',
        2
    ], 'Do', 'date');
    // ALIASES
    addUnitAlias('date', 'D');
    // PARSING
    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });
    addParseToken([
        'D',
        'DD'
    ], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });
    // MOMENTS
    var getSetDayOfMonth = makeGetSet('Date', true);
    addFormatToken('d', 0, 'do', 'day');
    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });
    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });
    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });
    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');
    // ALIASES
    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');
    // PARSING
    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', matchWord);
    addRegexToken('ddd', matchWord);
    addRegexToken('dddd', matchWord);
    addWeekParseToken([
        'dd',
        'ddd',
        'dddd'
    ], function (input, week, config) {
        var weekday = config._locale.weekdaysParse(input);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });
    addWeekParseToken([
        'd',
        'e',
        'E'
    ], function (input, week, config, token) {
        week[token] = toInt(input);
    });
    // HELPERS
    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }
        if (!isNaN(input)) {
            return parseInt(input, 10);
        }
        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }
        return null;
    }
    // LOCALES
    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays(m) {
        return this._weekdays[m.day()];
    }
    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort(m) {
        return this._weekdaysShort[m.day()];
    }
    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin(m) {
        return this._weekdaysMin[m.day()];
    }
    function localeWeekdaysParse(weekdayName) {
        var i, mom, regex;
        this._weekdaysParse = this._weekdaysParse || [];
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            if (!this._weekdaysParse[i]) {
                mom = local__createLocal([
                    2000,
                    1
                ]).day(i);
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }
    // MOMENTS
    function getSetDayOfWeek(input) {
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }
    function getSetLocaleDayOfWeek(input) {
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }
    function getSetISODayOfWeek(input) {
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }
    addFormatToken('H', [
        'HH',
        2
    ], 0, 'hour');
    addFormatToken('h', [
        'hh',
        2
    ], 0, function () {
        return this.hours() % 12 || 12;
    });
    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }
    meridiem('a', true);
    meridiem('A', false);
    // ALIASES
    addUnitAlias('hour', 'h');
    // PARSING
    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }
    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addParseToken([
        'H',
        'HH'
    ], HOUR);
    addParseToken([
        'a',
        'A'
    ], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken([
        'h',
        'hh'
    ], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    // LOCALES
    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return (input + '').toLowerCase().charAt(0) === 'p';
    }
    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }
    // MOMENTS
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);
    addFormatToken('m', [
        'mm',
        2
    ], 0, 'minute');
    // ALIASES
    addUnitAlias('minute', 'm');
    // PARSING
    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken([
        'm',
        'mm'
    ], MINUTE);
    // MOMENTS
    var getSetMinute = makeGetSet('Minutes', false);
    addFormatToken('s', [
        'ss',
        2
    ], 0, 'second');
    // ALIASES
    addUnitAlias('second', 's');
    // PARSING
    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken([
        's',
        'ss'
    ], SECOND);
    // MOMENTS
    var getSetSecond = makeGetSet('Seconds', false);
    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });
    addFormatToken(0, [
        'SS',
        2
    ], 0, function () {
        return ~~(this.millisecond() / 10);
    });
    addFormatToken(0, [
        'SSS',
        3
    ], 0, 'millisecond');
    addFormatToken(0, [
        'SSSS',
        4
    ], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, [
        'SSSSS',
        5
    ], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, [
        'SSSSSS',
        6
    ], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, [
        'SSSSSSS',
        7
    ], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, [
        'SSSSSSSS',
        8
    ], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, [
        'SSSSSSSSS',
        9
    ], 0, function () {
        return this.millisecond() * 1000000;
    });
    // ALIASES
    addUnitAlias('millisecond', 'ms');
    // PARSING
    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);
    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }
    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }
    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS
    var getSetMillisecond = makeGetSet('Milliseconds', false);
    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');
    // MOMENTS
    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }
    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }
    var momentPrototype__proto = Moment.prototype;
    momentPrototype__proto.add = add_subtract__add;
    momentPrototype__proto.calendar = moment_calendar__calendar;
    momentPrototype__proto.clone = clone;
    momentPrototype__proto.diff = diff;
    momentPrototype__proto.endOf = endOf;
    momentPrototype__proto.format = moment_format__format;
    momentPrototype__proto.from = from;
    momentPrototype__proto.fromNow = fromNow;
    momentPrototype__proto.to = to;
    momentPrototype__proto.toNow = toNow;
    momentPrototype__proto.get = getSet;
    momentPrototype__proto.invalidAt = invalidAt;
    momentPrototype__proto.isAfter = isAfter;
    momentPrototype__proto.isBefore = isBefore;
    momentPrototype__proto.isBetween = isBetween;
    momentPrototype__proto.isSame = isSame;
    momentPrototype__proto.isValid = moment_valid__isValid;
    momentPrototype__proto.lang = lang;
    momentPrototype__proto.locale = locale;
    momentPrototype__proto.localeData = localeData;
    momentPrototype__proto.max = prototypeMax;
    momentPrototype__proto.min = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set = getSet;
    momentPrototype__proto.startOf = startOf;
    momentPrototype__proto.subtract = add_subtract__subtract;
    momentPrototype__proto.toArray = toArray;
    momentPrototype__proto.toObject = toObject;
    momentPrototype__proto.toDate = toDate;
    momentPrototype__proto.toISOString = moment_format__toISOString;
    momentPrototype__proto.toJSON = moment_format__toISOString;
    momentPrototype__proto.toString = toString;
    momentPrototype__proto.unix = unix;
    momentPrototype__proto.valueOf = to_type__valueOf;
    // Year
    momentPrototype__proto.year = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;
    // Week Year
    momentPrototype__proto.weekYear = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;
    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;
    // Month
    momentPrototype__proto.month = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;
    // Week
    momentPrototype__proto.week = momentPrototype__proto.weeks = getSetWeek;
    momentPrototype__proto.isoWeek = momentPrototype__proto.isoWeeks = getSetISOWeek;
    momentPrototype__proto.weeksInYear = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;
    // Day
    momentPrototype__proto.date = getSetDayOfMonth;
    momentPrototype__proto.day = momentPrototype__proto.days = getSetDayOfWeek;
    momentPrototype__proto.weekday = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear = getSetDayOfYear;
    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;
    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;
    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;
    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;
    // Offset
    momentPrototype__proto.utcOffset = getSetOffset;
    momentPrototype__proto.utc = setOffsetToUTC;
    momentPrototype__proto.local = setOffsetToLocal;
    momentPrototype__proto.parseZone = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal = isLocal;
    momentPrototype__proto.isUtcOffset = isUtcOffset;
    momentPrototype__proto.isUtc = isUtc;
    momentPrototype__proto.isUTC = isUtc;
    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;
    // Deprecations
    momentPrototype__proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);
    var momentPrototype = momentPrototype__proto;
    function moment_moment__createUnix(input) {
        return local__createLocal(input * 1000);
    }
    function moment_moment__createInZone() {
        return local__createLocal.apply(null, arguments).parseZone();
    }
    var defaultCalendar = {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L'
        };
    function locale_calendar__calendar(key, mom, now) {
        var output = this._calendar[key];
        return typeof output === 'function' ? output.call(mom, now) : output;
    }
    var defaultLongDateFormat = {
            LTS: 'h:mm:ss A',
            LT: 'h:mm A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A'
        };
    function longDateFormat(key) {
        var format = this._longDateFormat[key], formatUpper = this._longDateFormat[key.toUpperCase()];
        if (format || !formatUpper) {
            return format;
        }
        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });
        return this._longDateFormat[key];
    }
    var defaultInvalidDate = 'Invalid date';
    function invalidDate() {
        return this._invalidDate;
    }
    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;
    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }
    function preParsePostFormat(string) {
        return string;
    }
    var defaultRelativeTime = {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years'
        };
    function relative__relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    }
    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    }
    function locale_set__set(config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (typeof prop === 'function') {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
    }
    var prototype__proto = Locale.prototype;
    prototype__proto._calendar = defaultCalendar;
    prototype__proto.calendar = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat = longDateFormat;
    prototype__proto._invalidDate = defaultInvalidDate;
    prototype__proto.invalidDate = invalidDate;
    prototype__proto._ordinal = defaultOrdinal;
    prototype__proto.ordinal = ordinal;
    prototype__proto._ordinalParse = defaultOrdinalParse;
    prototype__proto.preparse = preParsePostFormat;
    prototype__proto.postformat = preParsePostFormat;
    prototype__proto._relativeTime = defaultRelativeTime;
    prototype__proto.relativeTime = relative__relativeTime;
    prototype__proto.pastFuture = pastFuture;
    prototype__proto.set = locale_set__set;
    // Month
    prototype__proto.months = localeMonths;
    prototype__proto._months = defaultLocaleMonths;
    prototype__proto.monthsShort = localeMonthsShort;
    prototype__proto._monthsShort = defaultLocaleMonthsShort;
    prototype__proto.monthsParse = localeMonthsParse;
    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;
    // Day of Week
    prototype__proto.weekdays = localeWeekdays;
    prototype__proto._weekdays = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin = localeWeekdaysMin;
    prototype__proto._weekdaysMin = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort = localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse = localeWeekdaysParse;
    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;
    function lists__get(format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }
    function list(format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }
        format = format || '';
        if (index != null) {
            return lists__get(format, index, field, setter);
        }
        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }
    function lists__listMonths(format, index) {
        return list(format, index, 'months', 12, 'month');
    }
    function lists__listMonthsShort(format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }
    function lists__listWeekdays(format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }
    function lists__listWeekdaysShort(format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }
    function lists__listWeekdaysMin(format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }
    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10, output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
            return number + output;
        }
    });
    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);
    var mathAbs = Math.abs;
    function duration_abs__abs() {
        var data = this._data;
        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);
        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);
        return this;
    }
    function duration_add_subtract__addSubtract(duration, input, value, direction) {
        var other = create__createDuration(input, value);
        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;
        return duration._bubble();
    }
    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add(input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }
    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract(input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }
    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }
    function bubble() {
        var milliseconds = this._milliseconds;
        var days = this._days;
        var months = this._months;
        var data = this._data;
        var seconds, minutes, hours, years, monthsFromDays;
        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!(milliseconds >= 0 && days >= 0 && months >= 0 || milliseconds <= 0 && days <= 0 && months <= 0)) {
            milliseconds += absCeil(monthsToDays(months) + days) * 86400000;
            days = 0;
            months = 0;
        }
        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;
        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;
        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;
        hours = absFloor(minutes / 60);
        data.hours = hours % 24;
        days += absFloor(hours / 24);
        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));
        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;
        data.days = days;
        data.months = months;
        data.years = years;
        return this;
    }
    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }
    function monthsToDays(months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }
    function as(units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;
        units = normalizeUnits(units);
        if (units === 'month' || units === 'year') {
            days = this._days + milliseconds / 86400000;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
            case 'week':
                return days / 7 + milliseconds / 604800000;
            case 'day':
                return days + milliseconds / 86400000;
            case 'hour':
                return days * 24 + milliseconds / 3600000;
            case 'minute':
                return days * 1440 + milliseconds / 60000;
            case 'second':
                return days * 86400 + milliseconds / 1000;
            // Math.floor prevents floating point math errors here
            case 'millisecond':
                return Math.floor(days * 86400000) + milliseconds;
            default:
                throw new Error('Unknown unit ' + units);
            }
        }
    }
    // TODO: Use this.as('ms')?
    function duration_as__valueOf() {
        return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;
    }
    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }
    var asMilliseconds = makeAs('ms');
    var asSeconds = makeAs('s');
    var asMinutes = makeAs('m');
    var asHours = makeAs('h');
    var asDays = makeAs('d');
    var asWeeks = makeAs('w');
    var asMonths = makeAs('M');
    var asYears = makeAs('y');
    function duration_get__get(units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }
    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }
    var milliseconds = makeGetter('milliseconds');
    var seconds = makeGetter('seconds');
    var minutes = makeGetter('minutes');
    var hours = makeGetter('hours');
    var days = makeGetter('days');
    var duration_get__months = makeGetter('months');
    var years = makeGetter('years');
    function weeks() {
        return absFloor(this.days() / 7);
    }
    var round = Math.round;
    var thresholds = {
            s: 45,
            m: 45,
            h: 22,
            d: 26,
            M: 11
        };
    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function duration_humanize__relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds = round(duration.as('s'));
        var minutes = round(duration.as('m'));
        var hours = round(duration.as('h'));
        var days = round(duration.as('d'));
        var months = round(duration.as('M'));
        var years = round(duration.as('y'));
        var a = seconds < thresholds.s && [
                's',
                seconds
            ] || minutes === 1 && ['m'] || minutes < thresholds.m && [
                'mm',
                minutes
            ] || hours === 1 && ['h'] || hours < thresholds.h && [
                'hh',
                hours
            ] || days === 1 && ['d'] || days < thresholds.d && [
                'dd',
                days
            ] || months === 1 && ['M'] || months < thresholds.M && [
                'MM',
                months
            ] || years === 1 && ['y'] || [
                'yy',
                years
            ];
        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }
    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }
    function humanize(withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);
        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }
        return locale.postformat(output);
    }
    var iso_string__abs = Math.abs;
    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days = iso_string__abs(this._days);
        var months = iso_string__abs(this._months);
        var minutes, hours, years;
        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;
        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;
        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();
        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }
        return (total < 0 ? '-' : '') + 'P' + (Y ? Y + 'Y' : '') + (M ? M + 'M' : '') + (D ? D + 'D' : '') + (h || m || s ? 'T' : '') + (h ? h + 'H' : '') + (m ? m + 'M' : '') + (s ? s + 'S' : '');
    }
    var duration_prototype__proto = Duration.prototype;
    duration_prototype__proto.abs = duration_abs__abs;
    duration_prototype__proto.add = duration_add_subtract__add;
    duration_prototype__proto.subtract = duration_add_subtract__subtract;
    duration_prototype__proto.as = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds = asSeconds;
    duration_prototype__proto.asMinutes = asMinutes;
    duration_prototype__proto.asHours = asHours;
    duration_prototype__proto.asDays = asDays;
    duration_prototype__proto.asWeeks = asWeeks;
    duration_prototype__proto.asMonths = asMonths;
    duration_prototype__proto.asYears = asYears;
    duration_prototype__proto.valueOf = duration_as__valueOf;
    duration_prototype__proto._bubble = bubble;
    duration_prototype__proto.get = duration_get__get;
    duration_prototype__proto.milliseconds = milliseconds;
    duration_prototype__proto.seconds = seconds;
    duration_prototype__proto.minutes = minutes;
    duration_prototype__proto.hours = hours;
    duration_prototype__proto.days = days;
    duration_prototype__proto.weeks = weeks;
    duration_prototype__proto.months = duration_get__months;
    duration_prototype__proto.years = years;
    duration_prototype__proto.humanize = humanize;
    duration_prototype__proto.toISOString = iso_string__toISOString;
    duration_prototype__proto.toString = iso_string__toISOString;
    duration_prototype__proto.toJSON = iso_string__toISOString;
    duration_prototype__proto.locale = locale;
    duration_prototype__proto.localeData = localeData;
    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;
    // Side effect imports
    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');
    // PARSING
    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });
    // Side effect imports
    ;
    //! moment.js
    //! version : 2.10.6
    //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
    //! license : MIT
    //! momentjs.com
    utils_hooks__hooks.version = '2.10.6';
    setHookCallback(local__createLocal);
    utils_hooks__hooks.fn = momentPrototype;
    utils_hooks__hooks.min = min;
    utils_hooks__hooks.max = max;
    utils_hooks__hooks.utc = create_utc__createUTC;
    utils_hooks__hooks.unix = moment_moment__createUnix;
    utils_hooks__hooks.months = lists__listMonths;
    utils_hooks__hooks.isDate = isDate;
    utils_hooks__hooks.locale = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid = valid__createInvalid;
    utils_hooks__hooks.duration = create__createDuration;
    utils_hooks__hooks.isMoment = isMoment;
    utils_hooks__hooks.weekdays = lists__listWeekdays;
    utils_hooks__hooks.parseZone = moment_moment__createInZone;
    utils_hooks__hooks.localeData = locale_locales__getLocale;
    utils_hooks__hooks.isDuration = isDuration;
    utils_hooks__hooks.monthsShort = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale = defineLocale;
    utils_hooks__hooks.weekdaysShort = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    var _moment__default = utils_hooks__hooks;
    //! moment.js locale configuration
    //! locale : afrikaans (af)
    //! author : Werner Mollentze : https://github.com/wernerm
    var af = _moment__default.defineLocale('af', {
            months: 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
            monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
            weekdays: 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
            weekdaysShort: 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
            weekdaysMin: 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
            meridiemParse: /vm|nm/i,
            isPM: function (input) {
                return /^nm$/i.test(input);
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours < 12) {
                    return isLower ? 'vm' : 'VM';
                } else {
                    return isLower ? 'nm' : 'NM';
                }
            },
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Vandag om] LT',
                nextDay: '[M\xf4re om] LT',
                nextWeek: 'dddd [om] LT',
                lastDay: '[Gister om] LT',
                lastWeek: '[Laas] dddd [om] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'oor %s',
                past: '%s gelede',
                s: "'n paar sekondes",
                m: "'n minuut",
                mm: '%d minute',
                h: "'n uur",
                hh: '%d ure',
                d: "'n dag",
                dd: '%d dae',
                M: "'n maand",
                MM: '%d maande',
                y: "'n jaar",
                yy: '%d jaar'
            },
            ordinalParse: /\d{1,2}(ste|de)/,
            ordinal: function (number) {
                return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');    // Thanks to Joris Röling : https://github.com/jjupiter
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : Moroccan Arabic (ar-ma)
    //! author : ElFadili Yassine : https://github.com/ElFadiliY
    //! author : Abdel Said : https://github.com/abdelsaid
    var ar_ma = _moment__default.defineLocale('ar-ma', {
            months: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split('_'),
            monthsShort: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split('_'),
            weekdays: '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062a\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split('_'),
            weekdaysShort: '\u0627\u062d\u062f_\u0627\u062a\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split('_'),
            weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay: '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0641\u064a %s',
                past: '\u0645\u0646\u0630 %s',
                s: '\u062b\u0648\u0627\u0646',
                m: '\u062f\u0642\u064a\u0642\u0629',
                mm: '%d \u062f\u0642\u0627\u0626\u0642',
                h: '\u0633\u0627\u0639\u0629',
                hh: '%d \u0633\u0627\u0639\u0627\u062a',
                d: '\u064a\u0648\u0645',
                dd: '%d \u0623\u064a\u0627\u0645',
                M: '\u0634\u0647\u0631',
                MM: '%d \u0623\u0634\u0647\u0631',
                y: '\u0633\u0646\u0629',
                yy: '%d \u0633\u0646\u0648\u0627\u062a'
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    //! moment.js locale configuration
    //! locale : Arabic Saudi Arabia (ar-sa)
    //! author : Suhail Alkowaileet : https://github.com/xsoh
    var ar_sa__symbolMap = {
            '1': '\u0661',
            '2': '\u0662',
            '3': '\u0663',
            '4': '\u0664',
            '5': '\u0665',
            '6': '\u0666',
            '7': '\u0667',
            '8': '\u0668',
            '9': '\u0669',
            '0': '\u0660'
        }, ar_sa__numberMap = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0'
        };
    var ar_sa = _moment__default.defineLocale('ar-sa', {
            months: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a\u0648_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648_\u0623\u063a\u0633\u0637\u0633_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split('_'),
            monthsShort: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a\u0648_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648_\u0623\u063a\u0633\u0637\u0633_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split('_'),
            weekdays: '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split('_'),
            weekdaysShort: '\u0623\u062d\u062f_\u0625\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split('_'),
            weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            meridiemParse: /ص|م/,
            isPM: function (input) {
                return '\u0645' === input;
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 12) {
                    return '\u0635';
                } else {
                    return '\u0645';
                }
            },
            calendar: {
                sameDay: '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay: '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0641\u064a %s',
                past: '\u0645\u0646\u0630 %s',
                s: '\u062b\u0648\u0627\u0646',
                m: '\u062f\u0642\u064a\u0642\u0629',
                mm: '%d \u062f\u0642\u0627\u0626\u0642',
                h: '\u0633\u0627\u0639\u0629',
                hh: '%d \u0633\u0627\u0639\u0627\u062a',
                d: '\u064a\u0648\u0645',
                dd: '%d \u0623\u064a\u0627\u0645',
                M: '\u0634\u0647\u0631',
                MM: '%d \u0623\u0634\u0647\u0631',
                y: '\u0633\u0646\u0629',
                yy: '%d \u0633\u0646\u0648\u0627\u062a'
            },
            preparse: function (string) {
                return string.replace(/[١٢٣٤٥٦٧٨٩٠]/g, function (match) {
                    return ar_sa__numberMap[match];
                }).replace(/،/g, ',');
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return ar_sa__symbolMap[match];
                }).replace(/,/g, '\u060c');
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    //! moment.js locale configuration
    //! locale  : Tunisian Arabic (ar-tn)
    var ar_tn = _moment__default.defineLocale('ar-tn', {
            months: '\u062c\u0627\u0646\u0641\u064a_\u0641\u064a\u0641\u0631\u064a_\u0645\u0627\u0631\u0633_\u0623\u0641\u0631\u064a\u0644_\u0645\u0627\u064a_\u062c\u0648\u0627\u0646_\u062c\u0648\u064a\u0644\u064a\u0629_\u0623\u0648\u062a_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split('_'),
            monthsShort: '\u062c\u0627\u0646\u0641\u064a_\u0641\u064a\u0641\u0631\u064a_\u0645\u0627\u0631\u0633_\u0623\u0641\u0631\u064a\u0644_\u0645\u0627\u064a_\u062c\u0648\u0627\u0646_\u062c\u0648\u064a\u0644\u064a\u0629_\u0623\u0648\u062a_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split('_'),
            weekdays: '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split('_'),
            weekdaysShort: '\u0623\u062d\u062f_\u0625\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split('_'),
            weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay: '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0641\u064a %s',
                past: '\u0645\u0646\u0630 %s',
                s: '\u062b\u0648\u0627\u0646',
                m: '\u062f\u0642\u064a\u0642\u0629',
                mm: '%d \u062f\u0642\u0627\u0626\u0642',
                h: '\u0633\u0627\u0639\u0629',
                hh: '%d \u0633\u0627\u0639\u0627\u062a',
                d: '\u064a\u0648\u0645',
                dd: '%d \u0623\u064a\u0627\u0645',
                M: '\u0634\u0647\u0631',
                MM: '%d \u0623\u0634\u0647\u0631',
                y: '\u0633\u0646\u0629',
                yy: '%d \u0633\u0646\u0648\u0627\u062a'
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! Locale: Arabic (ar)
    //! Author: Abdel Said: https://github.com/abdelsaid
    //! Changes in months, weekdays: Ahmed Elkhatib
    //! Native plural forms: forabi https://github.com/forabi
    var ar__symbolMap = {
            '1': '\u0661',
            '2': '\u0662',
            '3': '\u0663',
            '4': '\u0664',
            '5': '\u0665',
            '6': '\u0666',
            '7': '\u0667',
            '8': '\u0668',
            '9': '\u0669',
            '0': '\u0660'
        }, ar__numberMap = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0'
        }, pluralForm = function (n) {
            return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
        }, plurals = {
            s: [
                '\u0623\u0642\u0644 \u0645\u0646 \u062b\u0627\u0646\u064a\u0629',
                '\u062b\u0627\u0646\u064a\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u062b\u0627\u0646\u064a\u062a\u0627\u0646',
                    '\u062b\u0627\u0646\u064a\u062a\u064a\u0646'
                ],
                '%d \u062b\u0648\u0627\u0646',
                '%d \u062b\u0627\u0646\u064a\u0629',
                '%d \u062b\u0627\u0646\u064a\u0629'
            ],
            m: [
                '\u0623\u0642\u0644 \u0645\u0646 \u062f\u0642\u064a\u0642\u0629',
                '\u062f\u0642\u064a\u0642\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u062f\u0642\u064a\u0642\u062a\u0627\u0646',
                    '\u062f\u0642\u064a\u0642\u062a\u064a\u0646'
                ],
                '%d \u062f\u0642\u0627\u0626\u0642',
                '%d \u062f\u0642\u064a\u0642\u0629',
                '%d \u062f\u0642\u064a\u0642\u0629'
            ],
            h: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0633\u0627\u0639\u0629',
                '\u0633\u0627\u0639\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u0633\u0627\u0639\u062a\u0627\u0646',
                    '\u0633\u0627\u0639\u062a\u064a\u0646'
                ],
                '%d \u0633\u0627\u0639\u0627\u062a',
                '%d \u0633\u0627\u0639\u0629',
                '%d \u0633\u0627\u0639\u0629'
            ],
            d: [
                '\u0623\u0642\u0644 \u0645\u0646 \u064a\u0648\u0645',
                '\u064a\u0648\u0645 \u0648\u0627\u062d\u062f',
                [
                    '\u064a\u0648\u0645\u0627\u0646',
                    '\u064a\u0648\u0645\u064a\u0646'
                ],
                '%d \u0623\u064a\u0627\u0645',
                '%d \u064a\u0648\u0645\u064b\u0627',
                '%d \u064a\u0648\u0645'
            ],
            M: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0634\u0647\u0631',
                '\u0634\u0647\u0631 \u0648\u0627\u062d\u062f',
                [
                    '\u0634\u0647\u0631\u0627\u0646',
                    '\u0634\u0647\u0631\u064a\u0646'
                ],
                '%d \u0623\u0634\u0647\u0631',
                '%d \u0634\u0647\u0631\u0627',
                '%d \u0634\u0647\u0631'
            ],
            y: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0639\u0627\u0645',
                '\u0639\u0627\u0645 \u0648\u0627\u062d\u062f',
                [
                    '\u0639\u0627\u0645\u0627\u0646',
                    '\u0639\u0627\u0645\u064a\u0646'
                ],
                '%d \u0623\u0639\u0648\u0627\u0645',
                '%d \u0639\u0627\u0645\u064b\u0627',
                '%d \u0639\u0627\u0645'
            ]
        }, pluralize = function (u) {
            return function (number, withoutSuffix, string, isFuture) {
                var f = pluralForm(number), str = plurals[u][pluralForm(number)];
                if (f === 2) {
                    str = str[withoutSuffix ? 0 : 1];
                }
                return str.replace(/%d/i, number);
            };
        }, ar__months = [
            '\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062b\u0627\u0646\u064a \u064a\u0646\u0627\u064a\u0631',
            '\u0634\u0628\u0627\u0637 \u0641\u0628\u0631\u0627\u064a\u0631',
            '\u0622\u0630\u0627\u0631 \u0645\u0627\u0631\u0633',
            '\u0646\u064a\u0633\u0627\u0646 \u0623\u0628\u0631\u064a\u0644',
            '\u0623\u064a\u0627\u0631 \u0645\u0627\u064a\u0648',
            '\u062d\u0632\u064a\u0631\u0627\u0646 \u064a\u0648\u0646\u064a\u0648',
            '\u062a\u0645\u0648\u0632 \u064a\u0648\u0644\u064a\u0648',
            '\u0622\u0628 \u0623\u063a\u0633\u0637\u0633',
            '\u0623\u064a\u0644\u0648\u0644 \u0633\u0628\u062a\u0645\u0628\u0631',
            '\u062a\u0634\u0631\u064a\u0646 \u0627\u0644\u0623\u0648\u0644 \u0623\u0643\u062a\u0648\u0628\u0631',
            '\u062a\u0634\u0631\u064a\u0646 \u0627\u0644\u062b\u0627\u0646\u064a \u0646\u0648\u0641\u0645\u0628\u0631',
            '\u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644 \u062f\u064a\u0633\u0645\u0628\u0631'
        ];
    var ar = _moment__default.defineLocale('ar', {
            months: ar__months,
            monthsShort: ar__months,
            weekdays: '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split('_'),
            weekdaysShort: '\u0623\u062d\u062f_\u0625\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split('_'),
            weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'D/\u200fM/\u200fYYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            meridiemParse: /ص|م/,
            isPM: function (input) {
                return '\u0645' === input;
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 12) {
                    return '\u0635';
                } else {
                    return '\u0645';
                }
            },
            calendar: {
                sameDay: '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay: '[\u063a\u062f\u064b\u0627 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek: 'dddd [\u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay: '[\u0623\u0645\u0633 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek: 'dddd [\u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0628\u0639\u062f %s',
                past: '\u0645\u0646\u0630 %s',
                s: pluralize('s'),
                m: pluralize('m'),
                mm: pluralize('m'),
                h: pluralize('h'),
                hh: pluralize('h'),
                d: pluralize('d'),
                dd: pluralize('d'),
                M: pluralize('M'),
                MM: pluralize('M'),
                y: pluralize('y'),
                yy: pluralize('y')
            },
            preparse: function (string) {
                return string.replace(/\u200f/g, '').replace(/[١٢٣٤٥٦٧٨٩٠]/g, function (match) {
                    return ar__numberMap[match];
                }).replace(/،/g, ',');
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return ar__symbolMap[match];
                }).replace(/,/g, '\u060c');
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    //! moment.js locale configuration
    //! locale : azerbaijani (az)
    //! author : topchiyev : https://github.com/topchiyev
    var az__suffixes = {
            1: '-inci',
            5: '-inci',
            8: '-inci',
            70: '-inci',
            80: '-inci',
            2: '-nci',
            7: '-nci',
            20: '-nci',
            50: '-nci',
            3: '-\xfcnc\xfc',
            4: '-\xfcnc\xfc',
            100: '-\xfcnc\xfc',
            6: '-nc\u0131',
            9: '-uncu',
            10: '-uncu',
            30: '-uncu',
            60: '-\u0131nc\u0131',
            90: '-\u0131nc\u0131'
        };
    var az = _moment__default.defineLocale('az', {
            months: 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
            monthsShort: 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
            weekdays: 'Bazar_Bazar ert\u0259si_\xc7\u0259r\u015f\u0259nb\u0259 ax\u015fam\u0131_\xc7\u0259r\u015f\u0259nb\u0259_C\xfcm\u0259 ax\u015fam\u0131_C\xfcm\u0259_\u015e\u0259nb\u0259'.split('_'),
            weekdaysShort: 'Baz_BzE_\xc7Ax_\xc7\u0259r_CAx_C\xfcm_\u015e\u0259n'.split('_'),
            weekdaysMin: 'Bz_BE_\xc7A_\xc7\u0259_CA_C\xfc_\u015e\u0259'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[bug\xfcn saat] LT',
                nextDay: '[sabah saat] LT',
                nextWeek: '[g\u0259l\u0259n h\u0259ft\u0259] dddd [saat] LT',
                lastDay: '[d\xfcn\u0259n] LT',
                lastWeek: '[ke\xe7\u0259n h\u0259ft\u0259] dddd [saat] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s sonra',
                past: '%s \u0259vv\u0259l',
                s: 'birne\xe7\u0259 saniyy\u0259',
                m: 'bir d\u0259qiq\u0259',
                mm: '%d d\u0259qiq\u0259',
                h: 'bir saat',
                hh: '%d saat',
                d: 'bir g\xfcn',
                dd: '%d g\xfcn',
                M: 'bir ay',
                MM: '%d ay',
                y: 'bir il',
                yy: '%d il'
            },
            meridiemParse: /gecə|səhər|gündüz|axşam/,
            isPM: function (input) {
                return /^(gündüz|axşam)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'gec\u0259';
                } else if (hour < 12) {
                    return 's\u0259h\u0259r';
                } else if (hour < 17) {
                    return 'g\xfcnd\xfcz';
                } else {
                    return 'ax\u015fam';
                }
            },
            ordinalParse: /\d{1,2}-(ıncı|inci|nci|üncü|ncı|uncu)/,
            ordinal: function (number) {
                if (number === 0) {
                    // special case for zero
                    return number + '-\u0131nc\u0131';
                }
                var a = number % 10, b = number % 100 - a, c = number >= 100 ? 100 : null;
                return number + (az__suffixes[a] || az__suffixes[b] || az__suffixes[c]);
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : belarusian (be)
    //! author : Dmitry Demidov : https://github.com/demidov91
    //! author: Praleska: http://praleska.pro/
    //! Author : Menelion Elensúle : https://github.com/Oire
    function be__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
    }
    function be__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': withoutSuffix ? '\u0445\u0432\u0456\u043b\u0456\u043d\u0430_\u0445\u0432\u0456\u043b\u0456\u043d\u044b_\u0445\u0432\u0456\u043b\u0456\u043d' : '\u0445\u0432\u0456\u043b\u0456\u043d\u0443_\u0445\u0432\u0456\u043b\u0456\u043d\u044b_\u0445\u0432\u0456\u043b\u0456\u043d',
                'hh': withoutSuffix ? '\u0433\u0430\u0434\u0437\u0456\u043d\u0430_\u0433\u0430\u0434\u0437\u0456\u043d\u044b_\u0433\u0430\u0434\u0437\u0456\u043d' : '\u0433\u0430\u0434\u0437\u0456\u043d\u0443_\u0433\u0430\u0434\u0437\u0456\u043d\u044b_\u0433\u0430\u0434\u0437\u0456\u043d',
                'dd': '\u0434\u0437\u0435\u043d\u044c_\u0434\u043d\u0456_\u0434\u0437\u0451\u043d',
                'MM': '\u043c\u0435\u0441\u044f\u0446_\u043c\u0435\u0441\u044f\u0446\u044b_\u043c\u0435\u0441\u044f\u0446\u0430\u045e',
                'yy': '\u0433\u043e\u0434_\u0433\u0430\u0434\u044b_\u0433\u0430\u0434\u043e\u045e'
            };
        if (key === 'm') {
            return withoutSuffix ? '\u0445\u0432\u0456\u043b\u0456\u043d\u0430' : '\u0445\u0432\u0456\u043b\u0456\u043d\u0443';
        } else if (key === 'h') {
            return withoutSuffix ? '\u0433\u0430\u0434\u0437\u0456\u043d\u0430' : '\u0433\u0430\u0434\u0437\u0456\u043d\u0443';
        } else {
            return number + ' ' + be__plural(format[key], +number);
        }
    }
    function be__monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u0441\u0442\u0443\u0434\u0437\u0435\u043d\u044c_\u043b\u044e\u0442\u044b_\u0441\u0430\u043a\u0430\u0432\u0456\u043a_\u043a\u0440\u0430\u0441\u0430\u0432\u0456\u043a_\u0442\u0440\u0430\u0432\u0435\u043d\u044c_\u0447\u044d\u0440\u0432\u0435\u043d\u044c_\u043b\u0456\u043f\u0435\u043d\u044c_\u0436\u043d\u0456\u0432\u0435\u043d\u044c_\u0432\u0435\u0440\u0430\u0441\u0435\u043d\u044c_\u043a\u0430\u0441\u0442\u0440\u044b\u0447\u043d\u0456\u043a_\u043b\u0456\u0441\u0442\u0430\u043f\u0430\u0434_\u0441\u043d\u0435\u0436\u0430\u043d\u044c'.split('_'),
                'accusative': '\u0441\u0442\u0443\u0434\u0437\u0435\u043d\u044f_\u043b\u044e\u0442\u0430\u0433\u0430_\u0441\u0430\u043a\u0430\u0432\u0456\u043a\u0430_\u043a\u0440\u0430\u0441\u0430\u0432\u0456\u043a\u0430_\u0442\u0440\u0430\u045e\u043d\u044f_\u0447\u044d\u0440\u0432\u0435\u043d\u044f_\u043b\u0456\u043f\u0435\u043d\u044f_\u0436\u043d\u0456\u045e\u043d\u044f_\u0432\u0435\u0440\u0430\u0441\u043d\u044f_\u043a\u0430\u0441\u0442\u0440\u044b\u0447\u043d\u0456\u043a\u0430_\u043b\u0456\u0441\u0442\u0430\u043f\u0430\u0434\u0430_\u0441\u043d\u0435\u0436\u043d\u044f'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function be__weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u043d\u044f\u0434\u0437\u0435\u043b\u044f_\u043f\u0430\u043d\u044f\u0434\u0437\u0435\u043b\u0430\u043a_\u0430\u045e\u0442\u043e\u0440\u0430\u043a_\u0441\u0435\u0440\u0430\u0434\u0430_\u0447\u0430\u0446\u0432\u0435\u0440_\u043f\u044f\u0442\u043d\u0456\u0446\u0430_\u0441\u0443\u0431\u043e\u0442\u0430'.split('_'),
                'accusative': '\u043d\u044f\u0434\u0437\u0435\u043b\u044e_\u043f\u0430\u043d\u044f\u0434\u0437\u0435\u043b\u0430\u043a_\u0430\u045e\u0442\u043e\u0440\u0430\u043a_\u0441\u0435\u0440\u0430\u0434\u0443_\u0447\u0430\u0446\u0432\u0435\u0440_\u043f\u044f\u0442\u043d\u0456\u0446\u0443_\u0441\u0443\u0431\u043e\u0442\u0443'.split('_')
            }, nounCase = /\[ ?[Вв] ?(?:мінулую|наступную)? ?\] ?dddd/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    var be = _moment__default.defineLocale('be', {
            months: be__monthsCaseReplace,
            monthsShort: '\u0441\u0442\u0443\u0434_\u043b\u044e\u0442_\u0441\u0430\u043a_\u043a\u0440\u0430\u0441_\u0442\u0440\u0430\u0432_\u0447\u044d\u0440\u0432_\u043b\u0456\u043f_\u0436\u043d\u0456\u0432_\u0432\u0435\u0440_\u043a\u0430\u0441\u0442_\u043b\u0456\u0441\u0442_\u0441\u043d\u0435\u0436'.split('_'),
            weekdays: be__weekdaysCaseReplace,
            weekdaysShort: '\u043d\u0434_\u043f\u043d_\u0430\u0442_\u0441\u0440_\u0447\u0446_\u043f\u0442_\u0441\u0431'.split('_'),
            weekdaysMin: '\u043d\u0434_\u043f\u043d_\u0430\u0442_\u0441\u0440_\u0447\u0446_\u043f\u0442_\u0441\u0431'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY \u0433.',
                LLL: 'D MMMM YYYY \u0433., HH:mm',
                LLLL: 'dddd, D MMMM YYYY \u0433., HH:mm'
            },
            calendar: {
                sameDay: '[\u0421\u0451\u043d\u043d\u044f \u045e] LT',
                nextDay: '[\u0417\u0430\u045e\u0442\u0440\u0430 \u045e] LT',
                lastDay: '[\u0423\u0447\u043e\u0440\u0430 \u045e] LT',
                nextWeek: function () {
                    return '[\u0423] dddd [\u045e] LT';
                },
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                    case 3:
                    case 5:
                    case 6:
                        return '[\u0423 \u043c\u0456\u043d\u0443\u043b\u0443\u044e] dddd [\u045e] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[\u0423 \u043c\u0456\u043d\u0443\u043b\u044b] dddd [\u045e] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u043f\u0440\u0430\u0437 %s',
                past: '%s \u0442\u0430\u043c\u0443',
                s: '\u043d\u0435\u043a\u0430\u043b\u044c\u043a\u0456 \u0441\u0435\u043a\u0443\u043d\u0434',
                m: be__relativeTimeWithPlural,
                mm: be__relativeTimeWithPlural,
                h: be__relativeTimeWithPlural,
                hh: be__relativeTimeWithPlural,
                d: '\u0434\u0437\u0435\u043d\u044c',
                dd: be__relativeTimeWithPlural,
                M: '\u043c\u0435\u0441\u044f\u0446',
                MM: be__relativeTimeWithPlural,
                y: '\u0433\u043e\u0434',
                yy: be__relativeTimeWithPlural
            },
            meridiemParse: /ночы|раніцы|дня|вечара/,
            isPM: function (input) {
                return /^(дня|вечара)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u043d\u043e\u0447\u044b';
                } else if (hour < 12) {
                    return '\u0440\u0430\u043d\u0456\u0446\u044b';
                } else if (hour < 17) {
                    return '\u0434\u043d\u044f';
                } else {
                    return '\u0432\u0435\u0447\u0430\u0440\u0430';
                }
            },
            ordinalParse: /\d{1,2}-(і|ы|га)/,
            ordinal: function (number, period) {
                switch (period) {
                case 'M':
                case 'd':
                case 'DDD':
                case 'w':
                case 'W':
                    return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-\u0456' : number + '-\u044b';
                case 'D':
                    return number + '-\u0433\u0430';
                default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : bulgarian (bg)
    //! author : Krasen Borisov : https://github.com/kraz
    var bg = _moment__default.defineLocale('bg', {
            months: '\u044f\u043d\u0443\u0430\u0440\u0438_\u0444\u0435\u0432\u0440\u0443\u0430\u0440\u0438_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0438\u043b_\u043c\u0430\u0439_\u044e\u043d\u0438_\u044e\u043b\u0438_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043f\u0442\u0435\u043c\u0432\u0440\u0438_\u043e\u043a\u0442\u043e\u043c\u0432\u0440\u0438_\u043d\u043e\u0435\u043c\u0432\u0440\u0438_\u0434\u0435\u043a\u0435\u043c\u0432\u0440\u0438'.split('_'),
            monthsShort: '\u044f\u043d\u0440_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0439_\u044e\u043d\u0438_\u044e\u043b\u0438_\u0430\u0432\u0433_\u0441\u0435\u043f_\u043e\u043a\u0442_\u043d\u043e\u0435_\u0434\u0435\u043a'.split('_'),
            weekdays: '\u043d\u0435\u0434\u0435\u043b\u044f_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u044f\u0434\u0430_\u0447\u0435\u0442\u0432\u044a\u0440\u0442\u044a\u043a_\u043f\u0435\u0442\u044a\u043a_\u0441\u044a\u0431\u043e\u0442\u0430'.split('_'),
            weekdaysShort: '\u043d\u0435\u0434_\u043f\u043e\u043d_\u0432\u0442\u043e_\u0441\u0440\u044f_\u0447\u0435\u0442_\u043f\u0435\u0442_\u0441\u044a\u0431'.split('_'),
            weekdaysMin: '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'D.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd, D MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[\u0414\u043d\u0435\u0441 \u0432] LT',
                nextDay: '[\u0423\u0442\u0440\u0435 \u0432] LT',
                nextWeek: 'dddd [\u0432] LT',
                lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                    case 3:
                    case 6:
                        return '[\u0412 \u0438\u0437\u043c\u0438\u043d\u0430\u043b\u0430\u0442\u0430] dddd [\u0432] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[\u0412 \u0438\u0437\u043c\u0438\u043d\u0430\u043b\u0438\u044f] dddd [\u0432] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0441\u043b\u0435\u0434 %s',
                past: '\u043f\u0440\u0435\u0434\u0438 %s',
                s: '\u043d\u044f\u043a\u043e\u043b\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
                m: '\u043c\u0438\u043d\u0443\u0442\u0430',
                mm: '%d \u043c\u0438\u043d\u0443\u0442\u0438',
                h: '\u0447\u0430\u0441',
                hh: '%d \u0447\u0430\u0441\u0430',
                d: '\u0434\u0435\u043d',
                dd: '%d \u0434\u043d\u0438',
                M: '\u043c\u0435\u0441\u0435\u0446',
                MM: '%d \u043c\u0435\u0441\u0435\u0446\u0430',
                y: '\u0433\u043e\u0434\u0438\u043d\u0430',
                yy: '%d \u0433\u043e\u0434\u0438\u043d\u0438'
            },
            ordinalParse: /\d{1,2}-(ев|ен|ти|ви|ри|ми)/,
            ordinal: function (number) {
                var lastDigit = number % 10, last2Digits = number % 100;
                if (number === 0) {
                    return number + '-\u0435\u0432';
                } else if (last2Digits === 0) {
                    return number + '-\u0435\u043d';
                } else if (last2Digits > 10 && last2Digits < 20) {
                    return number + '-\u0442\u0438';
                } else if (lastDigit === 1) {
                    return number + '-\u0432\u0438';
                } else if (lastDigit === 2) {
                    return number + '-\u0440\u0438';
                } else if (lastDigit === 7 || lastDigit === 8) {
                    return number + '-\u043c\u0438';
                } else {
                    return number + '-\u0442\u0438';
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Bengali (bn)
    //! author : Kaushik Gandhi : https://github.com/kaushikgandhi
    var bn__symbolMap = {
            '1': '\u09e7',
            '2': '\u09e8',
            '3': '\u09e9',
            '4': '\u09ea',
            '5': '\u09eb',
            '6': '\u09ec',
            '7': '\u09ed',
            '8': '\u09ee',
            '9': '\u09ef',
            '0': '\u09e6'
        }, bn__numberMap = {
            '\u09e7': '1',
            '\u09e8': '2',
            '\u09e9': '3',
            '\u09ea': '4',
            '\u09eb': '5',
            '\u09ec': '6',
            '\u09ed': '7',
            '\u09ee': '8',
            '\u09ef': '9',
            '\u09e6': '0'
        };
    var bn = _moment__default.defineLocale('bn', {
            months: '\u099c\u09be\u09a8\u09c1\u09df\u09be\u09b0\u09c0_\u09ab\u09c7\u09ac\u09c1\u09df\u09be\u09b0\u09c0_\u09ae\u09be\u09b0\u09cd\u099a_\u098f\u09aa\u09cd\u09b0\u09bf\u09b2_\u09ae\u09c7_\u099c\u09c1\u09a8_\u099c\u09c1\u09b2\u09be\u0987_\u0985\u0997\u09be\u09b8\u09cd\u099f_\u09b8\u09c7\u09aa\u09cd\u099f\u09c7\u09ae\u09cd\u09ac\u09b0_\u0985\u0995\u09cd\u099f\u09cb\u09ac\u09b0_\u09a8\u09ad\u09c7\u09ae\u09cd\u09ac\u09b0_\u09a1\u09bf\u09b8\u09c7\u09ae\u09cd\u09ac\u09b0'.split('_'),
            monthsShort: '\u099c\u09be\u09a8\u09c1_\u09ab\u09c7\u09ac_\u09ae\u09be\u09b0\u09cd\u099a_\u098f\u09aa\u09b0_\u09ae\u09c7_\u099c\u09c1\u09a8_\u099c\u09c1\u09b2_\u0985\u0997_\u09b8\u09c7\u09aa\u09cd\u099f_\u0985\u0995\u09cd\u099f\u09cb_\u09a8\u09ad_\u09a1\u09bf\u09b8\u09c7\u09ae\u09cd'.split('_'),
            weekdays: '\u09b0\u09ac\u09bf\u09ac\u09be\u09b0_\u09b8\u09cb\u09ae\u09ac\u09be\u09b0_\u09ae\u0999\u09cd\u0997\u09b2\u09ac\u09be\u09b0_\u09ac\u09c1\u09a7\u09ac\u09be\u09b0_\u09ac\u09c3\u09b9\u09b8\u09cd\u09aa\u09a4\u09cd\u09a4\u09bf\u09ac\u09be\u09b0_\u09b6\u09c1\u0995\u09cd\u09b0\u09c1\u09ac\u09be\u09b0_\u09b6\u09a8\u09bf\u09ac\u09be\u09b0'.split('_'),
            weekdaysShort: '\u09b0\u09ac\u09bf_\u09b8\u09cb\u09ae_\u09ae\u0999\u09cd\u0997\u09b2_\u09ac\u09c1\u09a7_\u09ac\u09c3\u09b9\u09b8\u09cd\u09aa\u09a4\u09cd\u09a4\u09bf_\u09b6\u09c1\u0995\u09cd\u09b0\u09c1_\u09b6\u09a8\u09bf'.split('_'),
            weekdaysMin: '\u09b0\u09ac_\u09b8\u09ae_\u09ae\u0999\u09cd\u0997_\u09ac\u09c1_\u09ac\u09cd\u09b0\u09bf\u09b9_\u09b6\u09c1_\u09b6\u09a8\u09bf'.split('_'),
            longDateFormat: {
                LT: 'A h:mm \u09b8\u09ae\u09df',
                LTS: 'A h:mm:ss \u09b8\u09ae\u09df',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A h:mm \u09b8\u09ae\u09df',
                LLLL: 'dddd, D MMMM YYYY, A h:mm \u09b8\u09ae\u09df'
            },
            calendar: {
                sameDay: '[\u0986\u099c] LT',
                nextDay: '[\u0986\u0997\u09be\u09ae\u09c0\u0995\u09be\u09b2] LT',
                nextWeek: 'dddd, LT',
                lastDay: '[\u0997\u09a4\u0995\u09be\u09b2] LT',
                lastWeek: '[\u0997\u09a4] dddd, LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \u09aa\u09b0\u09c7',
                past: '%s \u0986\u0997\u09c7',
                s: '\u0995\u098f\u0995 \u09b8\u09c7\u0995\u09c7\u09a8\u09cd\u09a1',
                m: '\u098f\u0995 \u09ae\u09bf\u09a8\u09bf\u099f',
                mm: '%d \u09ae\u09bf\u09a8\u09bf\u099f',
                h: '\u098f\u0995 \u0998\u09a8\u09cd\u099f\u09be',
                hh: '%d \u0998\u09a8\u09cd\u099f\u09be',
                d: '\u098f\u0995 \u09a6\u09bf\u09a8',
                dd: '%d \u09a6\u09bf\u09a8',
                M: '\u098f\u0995 \u09ae\u09be\u09b8',
                MM: '%d \u09ae\u09be\u09b8',
                y: '\u098f\u0995 \u09ac\u099b\u09b0',
                yy: '%d \u09ac\u099b\u09b0'
            },
            preparse: function (string) {
                return string.replace(/[১২৩৪৫৬৭৮৯০]/g, function (match) {
                    return bn__numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return bn__symbolMap[match];
                });
            },
            meridiemParse: /রাত|সকাল|দুপুর|বিকেল|রাত/,
            isPM: function (input) {
                return /^(দুপুর|বিকেল|রাত)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u09b0\u09be\u09a4';
                } else if (hour < 10) {
                    return '\u09b8\u0995\u09be\u09b2';
                } else if (hour < 17) {
                    return '\u09a6\u09c1\u09aa\u09c1\u09b0';
                } else if (hour < 20) {
                    return '\u09ac\u09bf\u0995\u09c7\u09b2';
                } else {
                    return '\u09b0\u09be\u09a4';
                }
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    //! moment.js locale configuration
    //! locale : tibetan (bo)
    //! author : Thupten N. Chakrishar : https://github.com/vajradog
    var bo__symbolMap = {
            '1': '\u0f21',
            '2': '\u0f22',
            '3': '\u0f23',
            '4': '\u0f24',
            '5': '\u0f25',
            '6': '\u0f26',
            '7': '\u0f27',
            '8': '\u0f28',
            '9': '\u0f29',
            '0': '\u0f20'
        }, bo__numberMap = {
            '\u0f21': '1',
            '\u0f22': '2',
            '\u0f23': '3',
            '\u0f24': '4',
            '\u0f25': '5',
            '\u0f26': '6',
            '\u0f27': '7',
            '\u0f28': '8',
            '\u0f29': '9',
            '\u0f20': '0'
        };
    var bo = _moment__default.defineLocale('bo', {
            months: '\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f44\u0f0b\u0f54\u0f7c_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f66\u0f74\u0f58\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f5e\u0f72\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f63\u0f94\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0fb2\u0f74\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f62\u0f92\u0fb1\u0f51\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f42\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f45\u0f72\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54'.split('_'),
            monthsShort: '\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f44\u0f0b\u0f54\u0f7c_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f66\u0f74\u0f58\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f5e\u0f72\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f63\u0f94\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0fb2\u0f74\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f62\u0f92\u0fb1\u0f51\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f42\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f45\u0f72\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54'.split('_'),
            weekdays: '\u0f42\u0f5f\u0f60\u0f0b\u0f49\u0f72\u0f0b\u0f58\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f5f\u0fb3\u0f0b\u0f56\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f58\u0f72\u0f42\u0f0b\u0f51\u0f58\u0f62\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f63\u0fb7\u0f42\u0f0b\u0f54\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f55\u0f74\u0f62\u0f0b\u0f56\u0f74_\u0f42\u0f5f\u0f60\u0f0b\u0f54\u0f0b\u0f66\u0f44\u0f66\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f66\u0fa4\u0f7a\u0f53\u0f0b\u0f54\u0f0b'.split('_'),
            weekdaysShort: '\u0f49\u0f72\u0f0b\u0f58\u0f0b_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b_\u0f58\u0f72\u0f42\u0f0b\u0f51\u0f58\u0f62\u0f0b_\u0f63\u0fb7\u0f42\u0f0b\u0f54\u0f0b_\u0f55\u0f74\u0f62\u0f0b\u0f56\u0f74_\u0f54\u0f0b\u0f66\u0f44\u0f66\u0f0b_\u0f66\u0fa4\u0f7a\u0f53\u0f0b\u0f54\u0f0b'.split('_'),
            weekdaysMin: '\u0f49\u0f72\u0f0b\u0f58\u0f0b_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b_\u0f58\u0f72\u0f42\u0f0b\u0f51\u0f58\u0f62\u0f0b_\u0f63\u0fb7\u0f42\u0f0b\u0f54\u0f0b_\u0f55\u0f74\u0f62\u0f0b\u0f56\u0f74_\u0f54\u0f0b\u0f66\u0f44\u0f66\u0f0b_\u0f66\u0fa4\u0f7a\u0f53\u0f0b\u0f54\u0f0b'.split('_'),
            longDateFormat: {
                LT: 'A h:mm',
                LTS: 'A h:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A h:mm',
                LLLL: 'dddd, D MMMM YYYY, A h:mm'
            },
            calendar: {
                sameDay: '[\u0f51\u0f72\u0f0b\u0f62\u0f72\u0f44] LT',
                nextDay: '[\u0f66\u0f44\u0f0b\u0f49\u0f72\u0f53] LT',
                nextWeek: '[\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f55\u0fb2\u0f42\u0f0b\u0f62\u0f97\u0f7a\u0f66\u0f0b\u0f58], LT',
                lastDay: '[\u0f41\u0f0b\u0f66\u0f44] LT',
                lastWeek: '[\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f55\u0fb2\u0f42\u0f0b\u0f58\u0f50\u0f60\u0f0b\u0f58] dddd, LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \u0f63\u0f0b',
                past: '%s \u0f66\u0f94\u0f53\u0f0b\u0f63',
                s: '\u0f63\u0f58\u0f0b\u0f66\u0f44',
                m: '\u0f66\u0f90\u0f62\u0f0b\u0f58\u0f0b\u0f42\u0f45\u0f72\u0f42',
                mm: '%d \u0f66\u0f90\u0f62\u0f0b\u0f58',
                h: '\u0f46\u0f74\u0f0b\u0f5a\u0f7c\u0f51\u0f0b\u0f42\u0f45\u0f72\u0f42',
                hh: '%d \u0f46\u0f74\u0f0b\u0f5a\u0f7c\u0f51',
                d: '\u0f49\u0f72\u0f53\u0f0b\u0f42\u0f45\u0f72\u0f42',
                dd: '%d \u0f49\u0f72\u0f53\u0f0b',
                M: '\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f45\u0f72\u0f42',
                MM: '%d \u0f5f\u0fb3\u0f0b\u0f56',
                y: '\u0f63\u0f7c\u0f0b\u0f42\u0f45\u0f72\u0f42',
                yy: '%d \u0f63\u0f7c'
            },
            preparse: function (string) {
                return string.replace(/[༡༢༣༤༥༦༧༨༩༠]/g, function (match) {
                    return bo__numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return bo__symbolMap[match];
                });
            },
            meridiemParse: /མཚན་མོ|ཞོགས་ཀས|ཉིན་གུང|དགོང་དག|མཚན་མོ/,
            isPM: function (input) {
                return /^(ཉིན་གུང|དགོང་དག|མཚན་མོ)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u0f58\u0f5a\u0f53\u0f0b\u0f58\u0f7c';
                } else if (hour < 10) {
                    return '\u0f5e\u0f7c\u0f42\u0f66\u0f0b\u0f40\u0f66';
                } else if (hour < 17) {
                    return '\u0f49\u0f72\u0f53\u0f0b\u0f42\u0f74\u0f44';
                } else if (hour < 20) {
                    return '\u0f51\u0f42\u0f7c\u0f44\u0f0b\u0f51\u0f42';
                } else {
                    return '\u0f58\u0f5a\u0f53\u0f0b\u0f58\u0f7c';
                }
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    //! moment.js locale configuration
    //! locale : breton (br)
    //! author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou
    function relativeTimeWithMutation(number, withoutSuffix, key) {
        var format = {
                'mm': 'munutenn',
                'MM': 'miz',
                'dd': 'devezh'
            };
        return number + ' ' + mutation(format[key], number);
    }
    function specialMutationForYears(number) {
        switch (lastNumber(number)) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 9:
            return number + ' bloaz';
        default:
            return number + ' vloaz';
        }
    }
    function lastNumber(number) {
        if (number > 9) {
            return lastNumber(number % 10);
        }
        return number;
    }
    function mutation(text, number) {
        if (number === 2) {
            return softMutation(text);
        }
        return text;
    }
    function softMutation(text) {
        var mutationTable = {
                'm': 'v',
                'b': 'v',
                'd': 'z'
            };
        if (mutationTable[text.charAt(0)] === undefined) {
            return text;
        }
        return mutationTable[text.charAt(0)] + text.substring(1);
    }
    var br = _moment__default.defineLocale('br', {
            months: "Genver_C'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu".split('_'),
            monthsShort: "Gen_C'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker".split('_'),
            weekdays: "Sul_Lun_Meurzh_Merc'her_Yaou_Gwener_Sadorn".split('_'),
            weekdaysShort: 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
            weekdaysMin: 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
            longDateFormat: {
                LT: 'h[e]mm A',
                LTS: 'h[e]mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D [a viz] MMMM YYYY',
                LLL: 'D [a viz] MMMM YYYY h[e]mm A',
                LLLL: 'dddd, D [a viz] MMMM YYYY h[e]mm A'
            },
            calendar: {
                sameDay: '[Hiziv da] LT',
                nextDay: "[Warc'hoazh da] LT",
                nextWeek: 'dddd [da] LT',
                lastDay: "[Dec'h da] LT",
                lastWeek: 'dddd [paset da] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'a-benn %s',
                past: "%s 'zo",
                s: 'un nebeud segondenno\xf9',
                m: 'ur vunutenn',
                mm: relativeTimeWithMutation,
                h: 'un eur',
                hh: '%d eur',
                d: 'un devezh',
                dd: relativeTimeWithMutation,
                M: 'ur miz',
                MM: relativeTimeWithMutation,
                y: 'ur bloaz',
                yy: specialMutationForYears
            },
            ordinalParse: /\d{1,2}(añ|vet)/,
            ordinal: function (number) {
                var output = number === 1 ? 'a\xf1' : 'vet';
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : bosnian (bs)
    //! author : Nedim Cholich : https://github.com/frontyard
    //! based on (hr) translation by Bojan Marković
    function bs__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }
    var bs = _moment__default.defineLocale('bs', {
            months: 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
            monthsShort: 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
            weekdays: 'nedjelja_ponedjeljak_utorak_srijeda_\u010detvrtak_petak_subota'.split('_'),
            weekdaysShort: 'ned._pon._uto._sri._\u010det._pet._sub.'.split('_'),
            weekdaysMin: 'ne_po_ut_sr_\u010de_pe_su'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[danas u] LT',
                nextDay: '[sutra u] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[u] [nedjelju] [u] LT';
                    case 3:
                        return '[u] [srijedu] [u] LT';
                    case 6:
                        return '[u] [subotu] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[u] dddd [u] LT';
                    }
                },
                lastDay: '[ju\u010der u] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                    case 3:
                        return '[pro\u0161lu] dddd [u] LT';
                    case 6:
                        return '[pro\u0161le] [subote] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[pro\u0161li] dddd [u] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: 'prije %s',
                s: 'par sekundi',
                m: bs__translate,
                mm: bs__translate,
                h: bs__translate,
                hh: bs__translate,
                d: 'dan',
                dd: bs__translate,
                M: 'mjesec',
                MM: bs__translate,
                y: 'godinu',
                yy: bs__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : catalan (ca)
    //! author : Juan G. Hurtado : https://github.com/juanghurtado
    var ca = _moment__default.defineLocale('ca', {
            months: 'gener_febrer_mar\xe7_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
            monthsShort: 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
            weekdays: 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
            weekdaysShort: 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
            weekdaysMin: 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'LT:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd D MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: function () {
                    return '[avui a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
                },
                nextDay: function () {
                    return '[dem\xe0 a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
                },
                nextWeek: function () {
                    return 'dddd [a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
                },
                lastDay: function () {
                    return '[ahir a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
                },
                lastWeek: function () {
                    return '[el] dddd [passat a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'en %s',
                past: 'fa %s',
                s: 'uns segons',
                m: 'un minut',
                mm: '%d minuts',
                h: 'una hora',
                hh: '%d hores',
                d: 'un dia',
                dd: '%d dies',
                M: 'un mes',
                MM: '%d mesos',
                y: 'un any',
                yy: '%d anys'
            },
            ordinalParse: /\d{1,2}(r|n|t|è|a)/,
            ordinal: function (number, period) {
                var output = number === 1 ? 'r' : number === 2 ? 'n' : number === 3 ? 'r' : number === 4 ? 't' : '\xe8';
                if (period === 'w' || period === 'W') {
                    output = 'a';
                }
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : czech (cs)
    //! author : petrbela : https://github.com/petrbela
    var cs__months = 'leden_\xfanor_b\u0159ezen_duben_kv\u011bten_\u010derven_\u010dervenec_srpen_z\xe1\u0159\xed_\u0159\xedjen_listopad_prosinec'.split('_'), cs__monthsShort = 'led_\xfano_b\u0159e_dub_kv\u011b_\u010dvn_\u010dvc_srp_z\xe1\u0159_\u0159\xedj_lis_pro'.split('_');
    function cs__plural(n) {
        return n > 1 && n < 5 && ~~(n / 10) !== 1;
    }
    function cs__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            // a few seconds / in a few seconds / a few seconds ago
            return withoutSuffix || isFuture ? 'p\xe1r sekund' : 'p\xe1r sekundami';
        case 'm':
            // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minuta' : isFuture ? 'minutu' : 'minutou';
        case 'mm':
            // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'minuty' : 'minut');
            } else {
                return result + 'minutami';
            }
            break;
        case 'h':
            // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
            // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'hodiny' : 'hodin');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':
            // a day / in a day / a day ago
            return withoutSuffix || isFuture ? 'den' : 'dnem';
        case 'dd':
            // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'dny' : 'dn\xed');
            } else {
                return result + 'dny';
            }
            break;
        case 'M':
            // a month / in a month / a month ago
            return withoutSuffix || isFuture ? 'm\u011bs\xedc' : 'm\u011bs\xedcem';
        case 'MM':
            // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'm\u011bs\xedce' : 'm\u011bs\xedc\u016f');
            } else {
                return result + 'm\u011bs\xedci';
            }
            break;
        case 'y':
            // a year / in a year / a year ago
            return withoutSuffix || isFuture ? 'rok' : 'rokem';
        case 'yy':
            // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'roky' : 'let');
            } else {
                return result + 'lety';
            }
            break;
        }
    }
    var cs = _moment__default.defineLocale('cs', {
            months: cs__months,
            monthsShort: cs__monthsShort,
            monthsParse: function (months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; i < 12; i++) {
                    // use custom parser to solve problem with July (červenec)
                    _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
                }
                return _monthsParse;
            }(cs__months, cs__monthsShort),
            weekdays: 'ned\u011ble_pond\u011bl\xed_\xfater\xfd_st\u0159eda_\u010dtvrtek_p\xe1tek_sobota'.split('_'),
            weekdaysShort: 'ne_po_\xfat_st_\u010dt_p\xe1_so'.split('_'),
            weekdaysMin: 'ne_po_\xfat_st_\u010dt_p\xe1_so'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[dnes v] LT',
                nextDay: '[z\xedtra v] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[v ned\u011bli v] LT';
                    case 1:
                    case 2:
                        return '[v] dddd [v] LT';
                    case 3:
                        return '[ve st\u0159edu v] LT';
                    case 4:
                        return '[ve \u010dtvrtek v] LT';
                    case 5:
                        return '[v p\xe1tek v] LT';
                    case 6:
                        return '[v sobotu v] LT';
                    }
                },
                lastDay: '[v\u010dera v] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[minulou ned\u011bli v] LT';
                    case 1:
                    case 2:
                        return '[minul\xe9] dddd [v] LT';
                    case 3:
                        return '[minulou st\u0159edu v] LT';
                    case 4:
                    case 5:
                        return '[minul\xfd] dddd [v] LT';
                    case 6:
                        return '[minulou sobotu v] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: 'p\u0159ed %s',
                s: cs__translate,
                m: cs__translate,
                mm: cs__translate,
                h: cs__translate,
                hh: cs__translate,
                d: cs__translate,
                dd: cs__translate,
                M: cs__translate,
                MM: cs__translate,
                y: cs__translate,
                yy: cs__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : chuvash (cv)
    //! author : Anatoly Mironov : https://github.com/mirontoli
    var cv = _moment__default.defineLocale('cv', {
            months: '\u043a\u04d1\u0440\u043b\u0430\u0447_\u043d\u0430\u0440\u04d1\u0441_\u043f\u0443\u0448_\u0430\u043a\u0430_\u043c\u0430\u0439_\u04ab\u04d7\u0440\u0442\u043c\u0435_\u0443\u0442\u04d1_\u04ab\u0443\u0440\u043b\u0430_\u0430\u0432\u04d1\u043d_\u044e\u043f\u0430_\u0447\u04f3\u043a_\u0440\u0430\u0448\u0442\u0430\u0432'.split('_'),
            monthsShort: '\u043a\u04d1\u0440_\u043d\u0430\u0440_\u043f\u0443\u0448_\u0430\u043a\u0430_\u043c\u0430\u0439_\u04ab\u04d7\u0440_\u0443\u0442\u04d1_\u04ab\u0443\u0440_\u0430\u0432\u043d_\u044e\u043f\u0430_\u0447\u04f3\u043a_\u0440\u0430\u0448'.split('_'),
            weekdays: '\u0432\u044b\u0440\u0441\u0430\u0440\u043d\u0438\u043a\u0443\u043d_\u0442\u0443\u043d\u0442\u0438\u043a\u0443\u043d_\u044b\u0442\u043b\u0430\u0440\u0438\u043a\u0443\u043d_\u044e\u043d\u043a\u0443\u043d_\u043a\u04d7\u04ab\u043d\u0435\u0440\u043d\u0438\u043a\u0443\u043d_\u044d\u0440\u043d\u0435\u043a\u0443\u043d_\u0448\u04d1\u043c\u0430\u0442\u043a\u0443\u043d'.split('_'),
            weekdaysShort: '\u0432\u044b\u0440_\u0442\u0443\u043d_\u044b\u0442\u043b_\u044e\u043d_\u043a\u04d7\u04ab_\u044d\u0440\u043d_\u0448\u04d1\u043c'.split('_'),
            weekdaysMin: '\u0432\u0440_\u0442\u043d_\u044b\u0442_\u044e\u043d_\u043a\u04ab_\u044d\u0440_\u0448\u043c'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD-MM-YYYY',
                LL: 'YYYY [\u04ab\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u04d1\u0445\u04d7\u043d] D[-\u043c\u04d7\u0448\u04d7]',
                LLL: 'YYYY [\u04ab\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u04d1\u0445\u04d7\u043d] D[-\u043c\u04d7\u0448\u04d7], HH:mm',
                LLLL: 'dddd, YYYY [\u04ab\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u04d1\u0445\u04d7\u043d] D[-\u043c\u04d7\u0448\u04d7], HH:mm'
            },
            calendar: {
                sameDay: '[\u041f\u0430\u044f\u043d] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                nextDay: '[\u042b\u0440\u0430\u043d] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                lastDay: '[\u04d6\u043d\u0435\u0440] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                nextWeek: '[\u04aa\u0438\u0442\u0435\u0441] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                lastWeek: '[\u0418\u0440\u0442\u043d\u04d7] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                sameElse: 'L'
            },
            relativeTime: {
                future: function (output) {
                    var affix = /сехет$/i.exec(output) ? '\u0440\u0435\u043d' : /ҫул$/i.exec(output) ? '\u0442\u0430\u043d' : '\u0440\u0430\u043d';
                    return output + affix;
                },
                past: '%s \u043a\u0430\u044f\u043b\u043b\u0430',
                s: '\u043f\u04d7\u0440-\u0438\u043a \u04ab\u0435\u043a\u043a\u0443\u043d\u0442',
                m: '\u043f\u04d7\u0440 \u043c\u0438\u043d\u0443\u0442',
                mm: '%d \u043c\u0438\u043d\u0443\u0442',
                h: '\u043f\u04d7\u0440 \u0441\u0435\u0445\u0435\u0442',
                hh: '%d \u0441\u0435\u0445\u0435\u0442',
                d: '\u043f\u04d7\u0440 \u043a\u0443\u043d',
                dd: '%d \u043a\u0443\u043d',
                M: '\u043f\u04d7\u0440 \u0443\u0439\u04d1\u0445',
                MM: '%d \u0443\u0439\u04d1\u0445',
                y: '\u043f\u04d7\u0440 \u04ab\u0443\u043b',
                yy: '%d \u04ab\u0443\u043b'
            },
            ordinalParse: /\d{1,2}-мӗш/,
            ordinal: '%d-\u043c\u04d7\u0448',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Welsh (cy)
    //! author : Robert Allen
    var cy = _moment__default.defineLocale('cy', {
            months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
            monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
            weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
            weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
            weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Heddiw am] LT',
                nextDay: '[Yfory am] LT',
                nextWeek: 'dddd [am] LT',
                lastDay: '[Ddoe am] LT',
                lastWeek: 'dddd [diwethaf am] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'mewn %s',
                past: '%s yn \xf4l',
                s: 'ychydig eiliadau',
                m: 'munud',
                mm: '%d munud',
                h: 'awr',
                hh: '%d awr',
                d: 'diwrnod',
                dd: '%d diwrnod',
                M: 'mis',
                MM: '%d mis',
                y: 'blwyddyn',
                yy: '%d flynedd'
            },
            ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
            ordinal: function (number) {
                var b = number, output = '', lookup = [
                        '',
                        'af',
                        'il',
                        'ydd',
                        'ydd',
                        'ed',
                        'ed',
                        'ed',
                        'fed',
                        'fed',
                        'fed',
                        'eg',
                        'fed',
                        'eg',
                        'eg',
                        'fed',
                        'eg',
                        'eg',
                        'fed',
                        'eg',
                        'fed'
                    ];
                if (b > 20) {
                    if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
                        output = 'fed';    // not 30ain, 70ain or 90ain
                    } else {
                        output = 'ain';
                    }
                } else if (b > 0) {
                    output = lookup[b];
                }
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : danish (da)
    //! author : Ulrik Nielsen : https://github.com/mrbase
    var da = _moment__default.defineLocale('da', {
            months: 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
            monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
            weekdays: 's\xf8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xf8rdag'.split('_'),
            weekdaysShort: 's\xf8n_man_tir_ons_tor_fre_l\xf8r'.split('_'),
            weekdaysMin: 's\xf8_ma_ti_on_to_fr_l\xf8'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY HH:mm',
                LLLL: 'dddd [d.] D. MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[I dag kl.] LT',
                nextDay: '[I morgen kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[I g\xe5r kl.] LT',
                lastWeek: '[sidste] dddd [kl] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'om %s',
                past: '%s siden',
                s: 'f\xe5 sekunder',
                m: 'et minut',
                mm: '%d minutter',
                h: 'en time',
                hh: '%d timer',
                d: 'en dag',
                dd: '%d dage',
                M: 'en m\xe5ned',
                MM: '%d m\xe5neder',
                y: 'et \xe5r',
                yy: '%d \xe5r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : austrian german (de-at)
    //! author : lluchs : https://github.com/lluchs
    //! author: Menelion Elensúle: https://github.com/Oire
    //! author : Martin Groller : https://github.com/MadMG
    function de_at__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
                'm': [
                    'eine Minute',
                    'einer Minute'
                ],
                'h': [
                    'eine Stunde',
                    'einer Stunde'
                ],
                'd': [
                    'ein Tag',
                    'einem Tag'
                ],
                'dd': [
                    number + ' Tage',
                    number + ' Tagen'
                ],
                'M': [
                    'ein Monat',
                    'einem Monat'
                ],
                'MM': [
                    number + ' Monate',
                    number + ' Monaten'
                ],
                'y': [
                    'ein Jahr',
                    'einem Jahr'
                ],
                'yy': [
                    number + ' Jahre',
                    number + ' Jahren'
                ]
            };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    var de_at = _moment__default.defineLocale('de-at', {
            months: 'J\xe4nner_Februar_M\xe4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
            monthsShort: 'J\xe4n._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
            weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
            weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY HH:mm',
                LLLL: 'dddd, D. MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[Morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[Gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]'
            },
            relativeTime: {
                future: 'in %s',
                past: 'vor %s',
                s: 'ein paar Sekunden',
                m: de_at__processRelativeTime,
                mm: '%d Minuten',
                h: de_at__processRelativeTime,
                hh: '%d Stunden',
                d: de_at__processRelativeTime,
                dd: de_at__processRelativeTime,
                M: de_at__processRelativeTime,
                MM: de_at__processRelativeTime,
                y: de_at__processRelativeTime,
                yy: de_at__processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : german (de)
    //! author : lluchs : https://github.com/lluchs
    //! author: Menelion Elensúle: https://github.com/Oire
    function de__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
                'm': [
                    'eine Minute',
                    'einer Minute'
                ],
                'h': [
                    'eine Stunde',
                    'einer Stunde'
                ],
                'd': [
                    'ein Tag',
                    'einem Tag'
                ],
                'dd': [
                    number + ' Tage',
                    number + ' Tagen'
                ],
                'M': [
                    'ein Monat',
                    'einem Monat'
                ],
                'MM': [
                    number + ' Monate',
                    number + ' Monaten'
                ],
                'y': [
                    'ein Jahr',
                    'einem Jahr'
                ],
                'yy': [
                    number + ' Jahre',
                    number + ' Jahren'
                ]
            };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    var de = _moment__default.defineLocale('de', {
            months: 'Januar_Februar_M\xe4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
            monthsShort: 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
            weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
            weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY HH:mm',
                LLLL: 'dddd, D. MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[Morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[Gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]'
            },
            relativeTime: {
                future: 'in %s',
                past: 'vor %s',
                s: 'ein paar Sekunden',
                m: de__processRelativeTime,
                mm: '%d Minuten',
                h: de__processRelativeTime,
                hh: '%d Stunden',
                d: de__processRelativeTime,
                dd: de__processRelativeTime,
                M: de__processRelativeTime,
                MM: de__processRelativeTime,
                y: de__processRelativeTime,
                yy: de__processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : modern greek (el)
    //! author : Aggelos Karalias : https://github.com/mehiel
    var el = _moment__default.defineLocale('el', {
            monthsNominativeEl: '\u0399\u03b1\u03bd\u03bf\u03c5\u03ac\u03c1\u03b9\u03bf\u03c2_\u03a6\u03b5\u03b2\u03c1\u03bf\u03c5\u03ac\u03c1\u03b9\u03bf\u03c2_\u039c\u03ac\u03c1\u03c4\u03b9\u03bf\u03c2_\u0391\u03c0\u03c1\u03af\u03bb\u03b9\u03bf\u03c2_\u039c\u03ac\u03b9\u03bf\u03c2_\u0399\u03bf\u03cd\u03bd\u03b9\u03bf\u03c2_\u0399\u03bf\u03cd\u03bb\u03b9\u03bf\u03c2_\u0391\u03cd\u03b3\u03bf\u03c5\u03c3\u03c4\u03bf\u03c2_\u03a3\u03b5\u03c0\u03c4\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2_\u039f\u03ba\u03c4\u03ce\u03b2\u03c1\u03b9\u03bf\u03c2_\u039d\u03bf\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2_\u0394\u03b5\u03ba\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2'.split('_'),
            monthsGenitiveEl: '\u0399\u03b1\u03bd\u03bf\u03c5\u03b1\u03c1\u03af\u03bf\u03c5_\u03a6\u03b5\u03b2\u03c1\u03bf\u03c5\u03b1\u03c1\u03af\u03bf\u03c5_\u039c\u03b1\u03c1\u03c4\u03af\u03bf\u03c5_\u0391\u03c0\u03c1\u03b9\u03bb\u03af\u03bf\u03c5_\u039c\u03b1\u0390\u03bf\u03c5_\u0399\u03bf\u03c5\u03bd\u03af\u03bf\u03c5_\u0399\u03bf\u03c5\u03bb\u03af\u03bf\u03c5_\u0391\u03c5\u03b3\u03bf\u03cd\u03c3\u03c4\u03bf\u03c5_\u03a3\u03b5\u03c0\u03c4\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5_\u039f\u03ba\u03c4\u03c9\u03b2\u03c1\u03af\u03bf\u03c5_\u039d\u03bf\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5_\u0394\u03b5\u03ba\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5'.split('_'),
            months: function (momentToFormat, format) {
                if (/D/.test(format.substring(0, format.indexOf('MMMM')))) {
                    // if there is a day number before 'MMMM'
                    return this._monthsGenitiveEl[momentToFormat.month()];
                } else {
                    return this._monthsNominativeEl[momentToFormat.month()];
                }
            },
            monthsShort: '\u0399\u03b1\u03bd_\u03a6\u03b5\u03b2_\u039c\u03b1\u03c1_\u0391\u03c0\u03c1_\u039c\u03b1\u03ca_\u0399\u03bf\u03c5\u03bd_\u0399\u03bf\u03c5\u03bb_\u0391\u03c5\u03b3_\u03a3\u03b5\u03c0_\u039f\u03ba\u03c4_\u039d\u03bf\u03b5_\u0394\u03b5\u03ba'.split('_'),
            weekdays: '\u039a\u03c5\u03c1\u03b9\u03b1\u03ba\u03ae_\u0394\u03b5\u03c5\u03c4\u03ad\u03c1\u03b1_\u03a4\u03c1\u03af\u03c4\u03b7_\u03a4\u03b5\u03c4\u03ac\u03c1\u03c4\u03b7_\u03a0\u03ad\u03bc\u03c0\u03c4\u03b7_\u03a0\u03b1\u03c1\u03b1\u03c3\u03ba\u03b5\u03c5\u03ae_\u03a3\u03ac\u03b2\u03b2\u03b1\u03c4\u03bf'.split('_'),
            weekdaysShort: '\u039a\u03c5\u03c1_\u0394\u03b5\u03c5_\u03a4\u03c1\u03b9_\u03a4\u03b5\u03c4_\u03a0\u03b5\u03bc_\u03a0\u03b1\u03c1_\u03a3\u03b1\u03b2'.split('_'),
            weekdaysMin: '\u039a\u03c5_\u0394\u03b5_\u03a4\u03c1_\u03a4\u03b5_\u03a0\u03b5_\u03a0\u03b1_\u03a3\u03b1'.split('_'),
            meridiem: function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? '\u03bc\u03bc' : '\u039c\u039c';
                } else {
                    return isLower ? '\u03c0\u03bc' : '\u03a0\u039c';
                }
            },
            isPM: function (input) {
                return (input + '').toLowerCase()[0] === '\u03bc';
            },
            meridiemParse: /[ΠΜ]\.?Μ?\.?/i,
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A'
            },
            calendarEl: {
                sameDay: '[\u03a3\u03ae\u03bc\u03b5\u03c1\u03b1 {}] LT',
                nextDay: '[\u0391\u03cd\u03c1\u03b9\u03bf {}] LT',
                nextWeek: 'dddd [{}] LT',
                lastDay: '[\u03a7\u03b8\u03b5\u03c2 {}] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 6:
                        return '[\u03c4\u03bf \u03c0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03bf] dddd [{}] LT';
                    default:
                        return '[\u03c4\u03b7\u03bd \u03c0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03b7] dddd [{}] LT';
                    }
                },
                sameElse: 'L'
            },
            calendar: function (key, mom) {
                var output = this._calendarEl[key], hours = mom && mom.hours();
                if (typeof output === 'function') {
                    output = output.apply(mom);
                }
                return output.replace('{}', hours % 12 === 1 ? '\u03c3\u03c4\u03b7' : '\u03c3\u03c4\u03b9\u03c2');
            },
            relativeTime: {
                future: '\u03c3\u03b5 %s',
                past: '%s \u03c0\u03c1\u03b9\u03bd',
                s: '\u03bb\u03af\u03b3\u03b1 \u03b4\u03b5\u03c5\u03c4\u03b5\u03c1\u03cc\u03bb\u03b5\u03c0\u03c4\u03b1',
                m: '\u03ad\u03bd\u03b1 \u03bb\u03b5\u03c0\u03c4\u03cc',
                mm: '%d \u03bb\u03b5\u03c0\u03c4\u03ac',
                h: '\u03bc\u03af\u03b1 \u03ce\u03c1\u03b1',
                hh: '%d \u03ce\u03c1\u03b5\u03c2',
                d: '\u03bc\u03af\u03b1 \u03bc\u03ad\u03c1\u03b1',
                dd: '%d \u03bc\u03ad\u03c1\u03b5\u03c2',
                M: '\u03ad\u03bd\u03b1\u03c2 \u03bc\u03ae\u03bd\u03b1\u03c2',
                MM: '%d \u03bc\u03ae\u03bd\u03b5\u03c2',
                y: '\u03ad\u03bd\u03b1\u03c2 \u03c7\u03c1\u03cc\u03bd\u03bf\u03c2',
                yy: '%d \u03c7\u03c1\u03cc\u03bd\u03b9\u03b1'
            },
            ordinalParse: /\d{1,2}η/,
            ordinal: '%d\u03b7',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : australian english (en-au)
    var en_au = _moment__default.defineLocale('en-au', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A'
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years'
            },
            ordinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (number) {
                var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : canadian english (en-ca)
    //! author : Jonathan Abourbih : https://github.com/jonbca
    var en_ca = _moment__default.defineLocale('en-ca', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'YYYY-MM-DD',
                LL: 'D MMMM, YYYY',
                LLL: 'D MMMM, YYYY h:mm A',
                LLLL: 'dddd, D MMMM, YYYY h:mm A'
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years'
            },
            ordinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (number) {
                var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
                return number + output;
            }
        });
    //! moment.js locale configuration
    //! locale : great britain english (en-gb)
    //! author : Chris Gedrim : https://github.com/chrisgedrim
    var en_gb = _moment__default.defineLocale('en-gb', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years'
            },
            ordinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (number) {
                var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : esperanto (eo)
    //! author : Colin Dean : https://github.com/colindean
    //! komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
    //!          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!
    var eo = _moment__default.defineLocale('eo', {
            months: 'januaro_februaro_marto_aprilo_majo_junio_julio_a\u016dgusto_septembro_oktobro_novembro_decembro'.split('_'),
            monthsShort: 'jan_feb_mar_apr_maj_jun_jul_a\u016dg_sep_okt_nov_dec'.split('_'),
            weekdays: 'Diman\u0109o_Lundo_Mardo_Merkredo_\u0134a\u016ddo_Vendredo_Sabato'.split('_'),
            weekdaysShort: 'Dim_Lun_Mard_Merk_\u0134a\u016d_Ven_Sab'.split('_'),
            weekdaysMin: 'Di_Lu_Ma_Me_\u0134a_Ve_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'D[-an de] MMMM, YYYY',
                LLL: 'D[-an de] MMMM, YYYY HH:mm',
                LLLL: 'dddd, [la] D[-an de] MMMM, YYYY HH:mm'
            },
            meridiemParse: /[ap]\.t\.m/i,
            isPM: function (input) {
                return input.charAt(0).toLowerCase() === 'p';
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? 'p.t.m.' : 'P.T.M.';
                } else {
                    return isLower ? 'a.t.m.' : 'A.T.M.';
                }
            },
            calendar: {
                sameDay: '[Hodia\u016d je] LT',
                nextDay: '[Morga\u016d je] LT',
                nextWeek: 'dddd [je] LT',
                lastDay: '[Hiera\u016d je] LT',
                lastWeek: '[pasinta] dddd [je] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'je %s',
                past: 'anta\u016d %s',
                s: 'sekundoj',
                m: 'minuto',
                mm: '%d minutoj',
                h: 'horo',
                hh: '%d horoj',
                d: 'tago',
                dd: '%d tagoj',
                M: 'monato',
                MM: '%d monatoj',
                y: 'jaro',
                yy: '%d jaroj'
            },
            ordinalParse: /\d{1,2}a/,
            ordinal: '%da',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : spanish (es)
    //! author : Julio Napurí : https://github.com/julionc
    var monthsShortDot = 'Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.'.split('_'), es__monthsShort = 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_');
    var es = _moment__default.defineLocale('es', {
            months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
            monthsShort: function (m, format) {
                if (/-MMM-/.test(format)) {
                    return es__monthsShort[m.month()];
                } else {
                    return monthsShortDot[m.month()];
                }
            },
            weekdays: 'Domingo_Lunes_Martes_Mi\xe9rcoles_Jueves_Viernes_S\xe1bado'.split('_'),
            weekdaysShort: 'Dom._Lun._Mar._Mi\xe9._Jue._Vie._S\xe1b.'.split('_'),
            weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_S\xe1'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [de] MMMM [de] YYYY',
                LLL: 'D [de] MMMM [de] YYYY H:mm',
                LLLL: 'dddd, D [de] MMMM [de] YYYY H:mm'
            },
            calendar: {
                sameDay: function () {
                    return '[hoy a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
                },
                nextDay: function () {
                    return '[ma\xf1ana a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
                },
                nextWeek: function () {
                    return 'dddd [a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
                },
                lastDay: function () {
                    return '[ayer a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
                },
                lastWeek: function () {
                    return '[el] dddd [pasado a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'en %s',
                past: 'hace %s',
                s: 'unos segundos',
                m: 'un minuto',
                mm: '%d minutos',
                h: 'una hora',
                hh: '%d horas',
                d: 'un d\xeda',
                dd: '%d d\xedas',
                M: 'un mes',
                MM: '%d meses',
                y: 'un a\xf1o',
                yy: '%d a\xf1os'
            },
            ordinalParse: /\d{1,2}º/,
            ordinal: '%d\xba',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : estonian (et)
    //! author : Henry Kehlmann : https://github.com/madhenry
    //! improvements : Illimar Tambek : https://github.com/ragulka
    function et__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
                's': [
                    'm\xf5ne sekundi',
                    'm\xf5ni sekund',
                    'paar sekundit'
                ],
                'm': [
                    '\xfche minuti',
                    '\xfcks minut'
                ],
                'mm': [
                    number + ' minuti',
                    number + ' minutit'
                ],
                'h': [
                    '\xfche tunni',
                    'tund aega',
                    '\xfcks tund'
                ],
                'hh': [
                    number + ' tunni',
                    number + ' tundi'
                ],
                'd': [
                    '\xfche p\xe4eva',
                    '\xfcks p\xe4ev'
                ],
                'M': [
                    'kuu aja',
                    'kuu aega',
                    '\xfcks kuu'
                ],
                'MM': [
                    number + ' kuu',
                    number + ' kuud'
                ],
                'y': [
                    '\xfche aasta',
                    'aasta',
                    '\xfcks aasta'
                ],
                'yy': [
                    number + ' aasta',
                    number + ' aastat'
                ]
            };
        if (withoutSuffix) {
            return format[key][2] ? format[key][2] : format[key][1];
        }
        return isFuture ? format[key][0] : format[key][1];
    }
    var et = _moment__default.defineLocale('et', {
            months: 'jaanuar_veebruar_m\xe4rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
            monthsShort: 'jaan_veebr_m\xe4rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
            weekdays: 'p\xfchap\xe4ev_esmasp\xe4ev_teisip\xe4ev_kolmap\xe4ev_neljap\xe4ev_reede_laup\xe4ev'.split('_'),
            weekdaysShort: 'P_E_T_K_N_R_L'.split('_'),
            weekdaysMin: 'P_E_T_K_N_R_L'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[T\xe4na,] LT',
                nextDay: '[Homme,] LT',
                nextWeek: '[J\xe4rgmine] dddd LT',
                lastDay: '[Eile,] LT',
                lastWeek: '[Eelmine] dddd LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s p\xe4rast',
                past: '%s tagasi',
                s: et__processRelativeTime,
                m: et__processRelativeTime,
                mm: et__processRelativeTime,
                h: et__processRelativeTime,
                hh: et__processRelativeTime,
                d: et__processRelativeTime,
                dd: '%d p\xe4eva',
                M: et__processRelativeTime,
                MM: et__processRelativeTime,
                y: et__processRelativeTime,
                yy: et__processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : euskara (eu)
    //! author : Eneko Illarramendi : https://github.com/eillarra
    var eu = _moment__default.defineLocale('eu', {
            months: 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
            monthsShort: 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
            weekdays: 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
            weekdaysShort: 'ig._al._ar._az._og._ol._lr.'.split('_'),
            weekdaysMin: 'ig_al_ar_az_og_ol_lr'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'YYYY[ko] MMMM[ren] D[a]',
                LLL: 'YYYY[ko] MMMM[ren] D[a] HH:mm',
                LLLL: 'dddd, YYYY[ko] MMMM[ren] D[a] HH:mm',
                l: 'YYYY-M-D',
                ll: 'YYYY[ko] MMM D[a]',
                lll: 'YYYY[ko] MMM D[a] HH:mm',
                llll: 'ddd, YYYY[ko] MMM D[a] HH:mm'
            },
            calendar: {
                sameDay: '[gaur] LT[etan]',
                nextDay: '[bihar] LT[etan]',
                nextWeek: 'dddd LT[etan]',
                lastDay: '[atzo] LT[etan]',
                lastWeek: '[aurreko] dddd LT[etan]',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s barru',
                past: 'duela %s',
                s: 'segundo batzuk',
                m: 'minutu bat',
                mm: '%d minutu',
                h: 'ordu bat',
                hh: '%d ordu',
                d: 'egun bat',
                dd: '%d egun',
                M: 'hilabete bat',
                MM: '%d hilabete',
                y: 'urte bat',
                yy: '%d urte'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Persian (fa)
    //! author : Ebrahim Byagowi : https://github.com/ebraminio
    var fa__symbolMap = {
            '1': '\u06f1',
            '2': '\u06f2',
            '3': '\u06f3',
            '4': '\u06f4',
            '5': '\u06f5',
            '6': '\u06f6',
            '7': '\u06f7',
            '8': '\u06f8',
            '9': '\u06f9',
            '0': '\u06f0'
        }, fa__numberMap = {
            '\u06f1': '1',
            '\u06f2': '2',
            '\u06f3': '3',
            '\u06f4': '4',
            '\u06f5': '5',
            '\u06f6': '6',
            '\u06f7': '7',
            '\u06f8': '8',
            '\u06f9': '9',
            '\u06f0': '0'
        };
    var fa = _moment__default.defineLocale('fa', {
            months: '\u0698\u0627\u0646\u0648\u06cc\u0647_\u0641\u0648\u0631\u06cc\u0647_\u0645\u0627\u0631\u0633_\u0622\u0648\u0631\u06cc\u0644_\u0645\u0647_\u0698\u0648\u0626\u0646_\u0698\u0648\u0626\u06cc\u0647_\u0627\u0648\u062a_\u0633\u067e\u062a\u0627\u0645\u0628\u0631_\u0627\u06a9\u062a\u0628\u0631_\u0646\u0648\u0627\u0645\u0628\u0631_\u062f\u0633\u0627\u0645\u0628\u0631'.split('_'),
            monthsShort: '\u0698\u0627\u0646\u0648\u06cc\u0647_\u0641\u0648\u0631\u06cc\u0647_\u0645\u0627\u0631\u0633_\u0622\u0648\u0631\u06cc\u0644_\u0645\u0647_\u0698\u0648\u0626\u0646_\u0698\u0648\u0626\u06cc\u0647_\u0627\u0648\u062a_\u0633\u067e\u062a\u0627\u0645\u0628\u0631_\u0627\u06a9\u062a\u0628\u0631_\u0646\u0648\u0627\u0645\u0628\u0631_\u062f\u0633\u0627\u0645\u0628\u0631'.split('_'),
            weekdays: '\u06cc\u06a9\u200c\u0634\u0646\u0628\u0647_\u062f\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200c\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067e\u0646\u062c\u200c\u0634\u0646\u0628\u0647_\u062c\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
            weekdaysShort: '\u06cc\u06a9\u200c\u0634\u0646\u0628\u0647_\u062f\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200c\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067e\u0646\u062c\u200c\u0634\u0646\u0628\u0647_\u062c\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
            weekdaysMin: '\u06cc_\u062f_\u0633_\u0686_\u067e_\u062c_\u0634'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            meridiemParse: /قبل از ظهر|بعد از ظهر/,
            isPM: function (input) {
                return /بعد از ظهر/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 12) {
                    return '\u0642\u0628\u0644 \u0627\u0632 \u0638\u0647\u0631';
                } else {
                    return '\u0628\u0639\u062f \u0627\u0632 \u0638\u0647\u0631';
                }
            },
            calendar: {
                sameDay: '[\u0627\u0645\u0631\u0648\u0632 \u0633\u0627\u0639\u062a] LT',
                nextDay: '[\u0641\u0631\u062f\u0627 \u0633\u0627\u0639\u062a] LT',
                nextWeek: 'dddd [\u0633\u0627\u0639\u062a] LT',
                lastDay: '[\u062f\u06cc\u0631\u0648\u0632 \u0633\u0627\u0639\u062a] LT',
                lastWeek: 'dddd [\u067e\u06cc\u0634] [\u0633\u0627\u0639\u062a] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u062f\u0631 %s',
                past: '%s \u067e\u06cc\u0634',
                s: '\u0686\u0646\u062f\u06cc\u0646 \u062b\u0627\u0646\u06cc\u0647',
                m: '\u06cc\u06a9 \u062f\u0642\u06cc\u0642\u0647',
                mm: '%d \u062f\u0642\u06cc\u0642\u0647',
                h: '\u06cc\u06a9 \u0633\u0627\u0639\u062a',
                hh: '%d \u0633\u0627\u0639\u062a',
                d: '\u06cc\u06a9 \u0631\u0648\u0632',
                dd: '%d \u0631\u0648\u0632',
                M: '\u06cc\u06a9 \u0645\u0627\u0647',
                MM: '%d \u0645\u0627\u0647',
                y: '\u06cc\u06a9 \u0633\u0627\u0644',
                yy: '%d \u0633\u0627\u0644'
            },
            preparse: function (string) {
                return string.replace(/[۰-۹]/g, function (match) {
                    return fa__numberMap[match];
                }).replace(/،/g, ',');
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return fa__symbolMap[match];
                }).replace(/,/g, '\u060c');
            },
            ordinalParse: /\d{1,2}م/,
            ordinal: '%d\u0645',
            week: {
                dow: 6,
                doy: 12
            }
        });
    //! moment.js locale configuration
    //! locale : finnish (fi)
    //! author : Tarmo Aidantausta : https://github.com/bleadof
    var numbersPast = 'nolla yksi kaksi kolme nelj\xe4 viisi kuusi seitsem\xe4n kahdeksan yhdeks\xe4n'.split(' '), numbersFuture = [
            'nolla',
            'yhden',
            'kahden',
            'kolmen',
            'nelj\xe4n',
            'viiden',
            'kuuden',
            numbersPast[7],
            numbersPast[8],
            numbersPast[9]
        ];
    function fi__translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
            return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
            result = isFuture ? 'minuutin' : 'minuuttia';
            break;
        case 'h':
            return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
            result = isFuture ? 'tunnin' : 'tuntia';
            break;
        case 'd':
            return isFuture ? 'p\xe4iv\xe4n' : 'p\xe4iv\xe4';
        case 'dd':
            result = isFuture ? 'p\xe4iv\xe4n' : 'p\xe4iv\xe4\xe4';
            break;
        case 'M':
            return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
            result = isFuture ? 'kuukauden' : 'kuukautta';
            break;
        case 'y':
            return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
            result = isFuture ? 'vuoden' : 'vuotta';
            break;
        }
        result = verbalNumber(number, isFuture) + ' ' + result;
        return result;
    }
    function verbalNumber(number, isFuture) {
        return number < 10 ? isFuture ? numbersFuture[number] : numbersPast[number] : number;
    }
    var fi = _moment__default.defineLocale('fi', {
            months: 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes\xe4kuu_hein\xe4kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
            monthsShort: 'tammi_helmi_maalis_huhti_touko_kes\xe4_hein\xe4_elo_syys_loka_marras_joulu'.split('_'),
            weekdays: 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
            weekdaysShort: 'su_ma_ti_ke_to_pe_la'.split('_'),
            weekdaysMin: 'su_ma_ti_ke_to_pe_la'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD.MM.YYYY',
                LL: 'Do MMMM[ta] YYYY',
                LLL: 'Do MMMM[ta] YYYY, [klo] HH.mm',
                LLLL: 'dddd, Do MMMM[ta] YYYY, [klo] HH.mm',
                l: 'D.M.YYYY',
                ll: 'Do MMM YYYY',
                lll: 'Do MMM YYYY, [klo] HH.mm',
                llll: 'ddd, Do MMM YYYY, [klo] HH.mm'
            },
            calendar: {
                sameDay: '[t\xe4n\xe4\xe4n] [klo] LT',
                nextDay: '[huomenna] [klo] LT',
                nextWeek: 'dddd [klo] LT',
                lastDay: '[eilen] [klo] LT',
                lastWeek: '[viime] dddd[na] [klo] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s p\xe4\xe4st\xe4',
                past: '%s sitten',
                s: fi__translate,
                m: fi__translate,
                mm: fi__translate,
                h: fi__translate,
                hh: fi__translate,
                d: fi__translate,
                dd: fi__translate,
                M: fi__translate,
                MM: fi__translate,
                y: fi__translate,
                yy: fi__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : faroese (fo)
    //! author : Ragnar Johannesen : https://github.com/ragnar123
    var fo = _moment__default.defineLocale('fo', {
            months: 'januar_februar_mars_apr\xedl_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
            monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays: 'sunnudagur_m\xe1nadagur_t\xfdsdagur_mikudagur_h\xf3sdagur_fr\xedggjadagur_leygardagur'.split('_'),
            weekdaysShort: 'sun_m\xe1n_t\xfds_mik_h\xf3s_fr\xed_ley'.split('_'),
            weekdaysMin: 'su_m\xe1_t\xfd_mi_h\xf3_fr_le'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D. MMMM, YYYY HH:mm'
            },
            calendar: {
                sameDay: '[\xcd dag kl.] LT',
                nextDay: '[\xcd morgin kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[\xcd gj\xe1r kl.] LT',
                lastWeek: '[s\xed\xf0stu] dddd [kl] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'um %s',
                past: '%s s\xed\xf0ani',
                s: 'f\xe1 sekund',
                m: 'ein minutt',
                mm: '%d minuttir',
                h: 'ein t\xedmi',
                hh: '%d t\xedmar',
                d: 'ein dagur',
                dd: '%d dagar',
                M: 'ein m\xe1na\xf0i',
                MM: '%d m\xe1na\xf0ir',
                y: 'eitt \xe1r',
                yy: '%d \xe1r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : canadian french (fr-ca)
    //! author : Jonathan Abourbih : https://github.com/jonbca
    var fr_ca = _moment__default.defineLocale('fr-ca', {
            months: 'janvier_f\xe9vrier_mars_avril_mai_juin_juillet_ao\xfbt_septembre_octobre_novembre_d\xe9cembre'.split('_'),
            monthsShort: 'janv._f\xe9vr._mars_avr._mai_juin_juil._ao\xfbt_sept._oct._nov._d\xe9c.'.split('_'),
            weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
            weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: "[Aujourd'hui \xe0] LT",
                nextDay: '[Demain \xe0] LT',
                nextWeek: 'dddd [\xe0] LT',
                lastDay: '[Hier \xe0] LT',
                lastWeek: 'dddd [dernier \xe0] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'dans %s',
                past: 'il y a %s',
                s: 'quelques secondes',
                m: 'une minute',
                mm: '%d minutes',
                h: 'une heure',
                hh: '%d heures',
                d: 'un jour',
                dd: '%d jours',
                M: 'un mois',
                MM: '%d mois',
                y: 'un an',
                yy: '%d ans'
            },
            ordinalParse: /\d{1,2}(er|e)/,
            ordinal: function (number) {
                return number + (number === 1 ? 'er' : 'e');
            }
        });
    //! moment.js locale configuration
    //! locale : french (fr)
    //! author : John Fischer : https://github.com/jfroffice
    var fr = _moment__default.defineLocale('fr', {
            months: 'janvier_f\xe9vrier_mars_avril_mai_juin_juillet_ao\xfbt_septembre_octobre_novembre_d\xe9cembre'.split('_'),
            monthsShort: 'janv._f\xe9vr._mars_avr._mai_juin_juil._ao\xfbt_sept._oct._nov._d\xe9c.'.split('_'),
            weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
            weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: "[Aujourd'hui \xe0] LT",
                nextDay: '[Demain \xe0] LT',
                nextWeek: 'dddd [\xe0] LT',
                lastDay: '[Hier \xe0] LT',
                lastWeek: 'dddd [dernier \xe0] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'dans %s',
                past: 'il y a %s',
                s: 'quelques secondes',
                m: 'une minute',
                mm: '%d minutes',
                h: 'une heure',
                hh: '%d heures',
                d: 'un jour',
                dd: '%d jours',
                M: 'un mois',
                MM: '%d mois',
                y: 'un an',
                yy: '%d ans'
            },
            ordinalParse: /\d{1,2}(er|)/,
            ordinal: function (number) {
                return number + (number === 1 ? 'er' : '');
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : frisian (fy)
    //! author : Robin van der Vliet : https://github.com/robin0van0der0v
    var fy__monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'), fy__monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');
    var fy = _moment__default.defineLocale('fy', {
            months: 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
            monthsShort: function (m, format) {
                if (/-MMM-/.test(format)) {
                    return fy__monthsShortWithoutDots[m.month()];
                } else {
                    return fy__monthsShortWithDots[m.month()];
                }
            },
            weekdays: 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
            weekdaysShort: 'si._mo._ti._wo._to._fr._so.'.split('_'),
            weekdaysMin: 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD-MM-YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[hjoed om] LT',
                nextDay: '[moarn om] LT',
                nextWeek: 'dddd [om] LT',
                lastDay: '[juster om] LT',
                lastWeek: '[\xf4fr\xfbne] dddd [om] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'oer %s',
                past: '%s lyn',
                s: 'in pear sekonden',
                m: 'ien min\xfat',
                mm: '%d minuten',
                h: 'ien oere',
                hh: '%d oeren',
                d: 'ien dei',
                dd: '%d dagen',
                M: 'ien moanne',
                MM: '%d moannen',
                y: 'ien jier',
                yy: '%d jierren'
            },
            ordinalParse: /\d{1,2}(ste|de)/,
            ordinal: function (number) {
                return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : galician (gl)
    //! author : Juan G. Hurtado : https://github.com/juanghurtado
    var gl = _moment__default.defineLocale('gl', {
            months: 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xu\xf1o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
            monthsShort: 'Xan._Feb._Mar._Abr._Mai._Xu\xf1._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
            weekdays: 'Domingo_Luns_Martes_M\xe9rcores_Xoves_Venres_S\xe1bado'.split('_'),
            weekdaysShort: 'Dom._Lun._Mar._M\xe9r._Xov._Ven._S\xe1b.'.split('_'),
            weekdaysMin: 'Do_Lu_Ma_M\xe9_Xo_Ve_S\xe1'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd D MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: function () {
                    return '[hoxe ' + (this.hours() !== 1 ? '\xe1s' : '\xe1') + '] LT';
                },
                nextDay: function () {
                    return '[ma\xf1\xe1 ' + (this.hours() !== 1 ? '\xe1s' : '\xe1') + '] LT';
                },
                nextWeek: function () {
                    return 'dddd [' + (this.hours() !== 1 ? '\xe1s' : 'a') + '] LT';
                },
                lastDay: function () {
                    return '[onte ' + (this.hours() !== 1 ? '\xe1' : 'a') + '] LT';
                },
                lastWeek: function () {
                    return '[o] dddd [pasado ' + (this.hours() !== 1 ? '\xe1s' : 'a') + '] LT';
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: function (str) {
                    if (str === 'uns segundos') {
                        return 'nuns segundos';
                    }
                    return 'en ' + str;
                },
                past: 'hai %s',
                s: 'uns segundos',
                m: 'un minuto',
                mm: '%d minutos',
                h: 'unha hora',
                hh: '%d horas',
                d: 'un d\xeda',
                dd: '%d d\xedas',
                M: 'un mes',
                MM: '%d meses',
                y: 'un ano',
                yy: '%d anos'
            },
            ordinalParse: /\d{1,2}º/,
            ordinal: '%d\xba',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Hebrew (he)
    //! author : Tomer Cohen : https://github.com/tomer
    //! author : Moshe Simantov : https://github.com/DevelopmentIL
    //! author : Tal Ater : https://github.com/TalAter
    var he = _moment__default.defineLocale('he', {
            months: '\u05d9\u05e0\u05d5\u05d0\u05e8_\u05e4\u05d1\u05e8\u05d5\u05d0\u05e8_\u05de\u05e8\u05e5_\u05d0\u05e4\u05e8\u05d9\u05dc_\u05de\u05d0\u05d9_\u05d9\u05d5\u05e0\u05d9_\u05d9\u05d5\u05dc\u05d9_\u05d0\u05d5\u05d2\u05d5\u05e1\u05d8_\u05e1\u05e4\u05d8\u05de\u05d1\u05e8_\u05d0\u05d5\u05e7\u05d8\u05d5\u05d1\u05e8_\u05e0\u05d5\u05d1\u05de\u05d1\u05e8_\u05d3\u05e6\u05de\u05d1\u05e8'.split('_'),
            monthsShort: '\u05d9\u05e0\u05d5\u05f3_\u05e4\u05d1\u05e8\u05f3_\u05de\u05e8\u05e5_\u05d0\u05e4\u05e8\u05f3_\u05de\u05d0\u05d9_\u05d9\u05d5\u05e0\u05d9_\u05d9\u05d5\u05dc\u05d9_\u05d0\u05d5\u05d2\u05f3_\u05e1\u05e4\u05d8\u05f3_\u05d0\u05d5\u05e7\u05f3_\u05e0\u05d5\u05d1\u05f3_\u05d3\u05e6\u05de\u05f3'.split('_'),
            weekdays: '\u05e8\u05d0\u05e9\u05d5\u05df_\u05e9\u05e0\u05d9_\u05e9\u05dc\u05d9\u05e9\u05d9_\u05e8\u05d1\u05d9\u05e2\u05d9_\u05d7\u05de\u05d9\u05e9\u05d9_\u05e9\u05d9\u05e9\u05d9_\u05e9\u05d1\u05ea'.split('_'),
            weekdaysShort: '\u05d0\u05f3_\u05d1\u05f3_\u05d2\u05f3_\u05d3\u05f3_\u05d4\u05f3_\u05d5\u05f3_\u05e9\u05f3'.split('_'),
            weekdaysMin: '\u05d0_\u05d1_\u05d2_\u05d3_\u05d4_\u05d5_\u05e9'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [\u05d1]MMMM YYYY',
                LLL: 'D [\u05d1]MMMM YYYY HH:mm',
                LLLL: 'dddd, D [\u05d1]MMMM YYYY HH:mm',
                l: 'D/M/YYYY',
                ll: 'D MMM YYYY',
                lll: 'D MMM YYYY HH:mm',
                llll: 'ddd, D MMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[\u05d4\u05d9\u05d5\u05dd \u05d1\u05be]LT',
                nextDay: '[\u05de\u05d7\u05e8 \u05d1\u05be]LT',
                nextWeek: 'dddd [\u05d1\u05e9\u05e2\u05d4] LT',
                lastDay: '[\u05d0\u05ea\u05de\u05d5\u05dc \u05d1\u05be]LT',
                lastWeek: '[\u05d1\u05d9\u05d5\u05dd] dddd [\u05d4\u05d0\u05d7\u05e8\u05d5\u05df \u05d1\u05e9\u05e2\u05d4] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u05d1\u05e2\u05d5\u05d3 %s',
                past: '\u05dc\u05e4\u05e0\u05d9 %s',
                s: '\u05de\u05e1\u05e4\u05e8 \u05e9\u05e0\u05d9\u05d5\u05ea',
                m: '\u05d3\u05e7\u05d4',
                mm: '%d \u05d3\u05e7\u05d5\u05ea',
                h: '\u05e9\u05e2\u05d4',
                hh: function (number) {
                    if (number === 2) {
                        return '\u05e9\u05e2\u05ea\u05d9\u05d9\u05dd';
                    }
                    return number + ' \u05e9\u05e2\u05d5\u05ea';
                },
                d: '\u05d9\u05d5\u05dd',
                dd: function (number) {
                    if (number === 2) {
                        return '\u05d9\u05d5\u05de\u05d9\u05d9\u05dd';
                    }
                    return number + ' \u05d9\u05de\u05d9\u05dd';
                },
                M: '\u05d7\u05d5\u05d3\u05e9',
                MM: function (number) {
                    if (number === 2) {
                        return '\u05d7\u05d5\u05d3\u05e9\u05d9\u05d9\u05dd';
                    }
                    return number + ' \u05d7\u05d5\u05d3\u05e9\u05d9\u05dd';
                },
                y: '\u05e9\u05e0\u05d4',
                yy: function (number) {
                    if (number === 2) {
                        return '\u05e9\u05e0\u05ea\u05d9\u05d9\u05dd';
                    } else if (number % 10 === 0 && number !== 10) {
                        return number + ' \u05e9\u05e0\u05d4';
                    }
                    return number + ' \u05e9\u05e0\u05d9\u05dd';
                }
            }
        });
    //! moment.js locale configuration
    //! locale : hindi (hi)
    //! author : Mayank Singhal : https://github.com/mayanksinghal
    var hi__symbolMap = {
            '1': '\u0967',
            '2': '\u0968',
            '3': '\u0969',
            '4': '\u096a',
            '5': '\u096b',
            '6': '\u096c',
            '7': '\u096d',
            '8': '\u096e',
            '9': '\u096f',
            '0': '\u0966'
        }, hi__numberMap = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096a': '4',
            '\u096b': '5',
            '\u096c': '6',
            '\u096d': '7',
            '\u096e': '8',
            '\u096f': '9',
            '\u0966': '0'
        };
    var hi = _moment__default.defineLocale('hi', {
            months: '\u091c\u0928\u0935\u0930\u0940_\u092b\u093c\u0930\u0935\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u0948\u0932_\u092e\u0908_\u091c\u0942\u0928_\u091c\u0941\u0932\u093e\u0908_\u0905\u0917\u0938\u094d\u0924_\u0938\u093f\u0924\u092e\u094d\u092c\u0930_\u0905\u0915\u094d\u091f\u0942\u092c\u0930_\u0928\u0935\u092e\u094d\u092c\u0930_\u0926\u093f\u0938\u092e\u094d\u092c\u0930'.split('_'),
            monthsShort: '\u091c\u0928._\u092b\u093c\u0930._\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u0948._\u092e\u0908_\u091c\u0942\u0928_\u091c\u0941\u0932._\u0905\u0917._\u0938\u093f\u0924._\u0905\u0915\u094d\u091f\u0942._\u0928\u0935._\u0926\u093f\u0938.'.split('_'),
            weekdays: '\u0930\u0935\u093f\u0935\u093e\u0930_\u0938\u094b\u092e\u0935\u093e\u0930_\u092e\u0902\u0917\u0932\u0935\u093e\u0930_\u092c\u0941\u0927\u0935\u093e\u0930_\u0917\u0941\u0930\u0942\u0935\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u0935\u093e\u0930_\u0936\u0928\u093f\u0935\u093e\u0930'.split('_'),
            weekdaysShort: '\u0930\u0935\u093f_\u0938\u094b\u092e_\u092e\u0902\u0917\u0932_\u092c\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094d\u0930_\u0936\u0928\u093f'.split('_'),
            weekdaysMin: '\u0930_\u0938\u094b_\u092e\u0902_\u092c\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split('_'),
            longDateFormat: {
                LT: 'A h:mm \u092c\u091c\u0947',
                LTS: 'A h:mm:ss \u092c\u091c\u0947',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A h:mm \u092c\u091c\u0947',
                LLLL: 'dddd, D MMMM YYYY, A h:mm \u092c\u091c\u0947'
            },
            calendar: {
                sameDay: '[\u0906\u091c] LT',
                nextDay: '[\u0915\u0932] LT',
                nextWeek: 'dddd, LT',
                lastDay: '[\u0915\u0932] LT',
                lastWeek: '[\u092a\u093f\u091b\u0932\u0947] dddd, LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \u092e\u0947\u0902',
                past: '%s \u092a\u0939\u0932\u0947',
                s: '\u0915\u0941\u091b \u0939\u0940 \u0915\u094d\u0937\u0923',
                m: '\u090f\u0915 \u092e\u093f\u0928\u091f',
                mm: '%d \u092e\u093f\u0928\u091f',
                h: '\u090f\u0915 \u0918\u0902\u091f\u093e',
                hh: '%d \u0918\u0902\u091f\u0947',
                d: '\u090f\u0915 \u0926\u093f\u0928',
                dd: '%d \u0926\u093f\u0928',
                M: '\u090f\u0915 \u092e\u0939\u0940\u0928\u0947',
                MM: '%d \u092e\u0939\u0940\u0928\u0947',
                y: '\u090f\u0915 \u0935\u0930\u094d\u0937',
                yy: '%d \u0935\u0930\u094d\u0937'
            },
            preparse: function (string) {
                return string.replace(/[१२३४५६७८९०]/g, function (match) {
                    return hi__numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return hi__symbolMap[match];
                });
            },
            meridiemParse: /रात|सुबह|दोपहर|शाम/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === '\u0930\u093e\u0924') {
                    return hour < 4 ? hour : hour + 12;
                } else if (meridiem === '\u0938\u0941\u092c\u0939') {
                    return hour;
                } else if (meridiem === '\u0926\u094b\u092a\u0939\u0930') {
                    return hour >= 10 ? hour : hour + 12;
                } else if (meridiem === '\u0936\u093e\u092e') {
                    return hour + 12;
                }
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u0930\u093e\u0924';
                } else if (hour < 10) {
                    return '\u0938\u0941\u092c\u0939';
                } else if (hour < 17) {
                    return '\u0926\u094b\u092a\u0939\u0930';
                } else if (hour < 20) {
                    return '\u0936\u093e\u092e';
                } else {
                    return '\u0930\u093e\u0924';
                }
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    //! moment.js locale configuration
    //! locale : hrvatski (hr)
    //! author : Bojan Marković : https://github.com/bmarkovic
    function hr__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }
    var hr = _moment__default.defineLocale('hr', {
            months: 'sije\u010danj_velja\u010da_o\u017eujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
            monthsShort: 'sij._velj._o\u017eu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
            weekdays: 'nedjelja_ponedjeljak_utorak_srijeda_\u010detvrtak_petak_subota'.split('_'),
            weekdaysShort: 'ned._pon._uto._sri._\u010det._pet._sub.'.split('_'),
            weekdaysMin: 'ne_po_ut_sr_\u010de_pe_su'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[danas u] LT',
                nextDay: '[sutra u] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[u] [nedjelju] [u] LT';
                    case 3:
                        return '[u] [srijedu] [u] LT';
                    case 6:
                        return '[u] [subotu] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[u] dddd [u] LT';
                    }
                },
                lastDay: '[ju\u010der u] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                    case 3:
                        return '[pro\u0161lu] dddd [u] LT';
                    case 6:
                        return '[pro\u0161le] [subote] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[pro\u0161li] dddd [u] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: 'prije %s',
                s: 'par sekundi',
                m: hr__translate,
                mm: hr__translate,
                h: hr__translate,
                hh: hr__translate,
                d: 'dan',
                dd: hr__translate,
                M: 'mjesec',
                MM: hr__translate,
                y: 'godinu',
                yy: hr__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : hungarian (hu)
    //! author : Adam Brunner : https://github.com/adambrunner
    var weekEndings = 'vas\xe1rnap h\xe9tf\u0151n kedden szerd\xe1n cs\xfct\xf6rt\xf6k\xf6n p\xe9nteken szombaton'.split(' ');
    function hu__translate(number, withoutSuffix, key, isFuture) {
        var num = number, suffix;
        switch (key) {
        case 's':
            return isFuture || withoutSuffix ? 'n\xe9h\xe1ny m\xe1sodperc' : 'n\xe9h\xe1ny m\xe1sodperce';
        case 'm':
            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
            return 'egy' + (isFuture || withoutSuffix ? ' \xf3ra' : ' \xf3r\xe1ja');
        case 'hh':
            return num + (isFuture || withoutSuffix ? ' \xf3ra' : ' \xf3r\xe1ja');
        case 'd':
            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
            return 'egy' + (isFuture || withoutSuffix ? ' h\xf3nap' : ' h\xf3napja');
        case 'MM':
            return num + (isFuture || withoutSuffix ? ' h\xf3nap' : ' h\xf3napja');
        case 'y':
            return 'egy' + (isFuture || withoutSuffix ? ' \xe9v' : ' \xe9ve');
        case 'yy':
            return num + (isFuture || withoutSuffix ? ' \xe9v' : ' \xe9ve');
        }
        return '';
    }
    function week(isFuture) {
        return (isFuture ? '' : '[m\xfalt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
    }
    var hu = _moment__default.defineLocale('hu', {
            months: 'janu\xe1r_febru\xe1r_m\xe1rcius_\xe1prilis_m\xe1jus_j\xfanius_j\xfalius_augusztus_szeptember_okt\xf3ber_november_december'.split('_'),
            monthsShort: 'jan_feb_m\xe1rc_\xe1pr_m\xe1j_j\xfan_j\xfal_aug_szept_okt_nov_dec'.split('_'),
            weekdays: 'vas\xe1rnap_h\xe9tf\u0151_kedd_szerda_cs\xfct\xf6rt\xf6k_p\xe9ntek_szombat'.split('_'),
            weekdaysShort: 'vas_h\xe9t_kedd_sze_cs\xfct_p\xe9n_szo'.split('_'),
            weekdaysMin: 'v_h_k_sze_cs_p_szo'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'YYYY.MM.DD.',
                LL: 'YYYY. MMMM D.',
                LLL: 'YYYY. MMMM D. H:mm',
                LLLL: 'YYYY. MMMM D., dddd H:mm'
            },
            meridiemParse: /de|du/i,
            isPM: function (input) {
                return input.charAt(1).toLowerCase() === 'u';
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours < 12) {
                    return isLower === true ? 'de' : 'DE';
                } else {
                    return isLower === true ? 'du' : 'DU';
                }
            },
            calendar: {
                sameDay: '[ma] LT[-kor]',
                nextDay: '[holnap] LT[-kor]',
                nextWeek: function () {
                    return week.call(this, true);
                },
                lastDay: '[tegnap] LT[-kor]',
                lastWeek: function () {
                    return week.call(this, false);
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s m\xfalva',
                past: '%s',
                s: hu__translate,
                m: hu__translate,
                mm: hu__translate,
                h: hu__translate,
                hh: hu__translate,
                d: hu__translate,
                dd: hu__translate,
                M: hu__translate,
                MM: hu__translate,
                y: hu__translate,
                yy: hu__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Armenian (hy-am)
    //! author : Armendarabyan : https://github.com/armendarabyan
    function hy_am__monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u0570\u0578\u0582\u0576\u057e\u0561\u0580_\u0583\u0565\u057f\u0580\u057e\u0561\u0580_\u0574\u0561\u0580\u057f_\u0561\u057a\u0580\u056b\u056c_\u0574\u0561\u0575\u056b\u057d_\u0570\u0578\u0582\u0576\u056b\u057d_\u0570\u0578\u0582\u056c\u056b\u057d_\u0585\u0563\u0578\u057d\u057f\u0578\u057d_\u057d\u0565\u057a\u057f\u0565\u0574\u0562\u0565\u0580_\u0570\u0578\u056f\u057f\u0565\u0574\u0562\u0565\u0580_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580_\u0564\u0565\u056f\u057f\u0565\u0574\u0562\u0565\u0580'.split('_'),
                'accusative': '\u0570\u0578\u0582\u0576\u057e\u0561\u0580\u056b_\u0583\u0565\u057f\u0580\u057e\u0561\u0580\u056b_\u0574\u0561\u0580\u057f\u056b_\u0561\u057a\u0580\u056b\u056c\u056b_\u0574\u0561\u0575\u056b\u057d\u056b_\u0570\u0578\u0582\u0576\u056b\u057d\u056b_\u0570\u0578\u0582\u056c\u056b\u057d\u056b_\u0585\u0563\u0578\u057d\u057f\u0578\u057d\u056b_\u057d\u0565\u057a\u057f\u0565\u0574\u0562\u0565\u0580\u056b_\u0570\u0578\u056f\u057f\u0565\u0574\u0562\u0565\u0580\u056b_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580\u056b_\u0564\u0565\u056f\u057f\u0565\u0574\u0562\u0565\u0580\u056b'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function hy_am__monthsShortCaseReplace(m, format) {
        var monthsShort = '\u0570\u0576\u057e_\u0583\u057f\u0580_\u0574\u0580\u057f_\u0561\u057a\u0580_\u0574\u0575\u057d_\u0570\u0576\u057d_\u0570\u056c\u057d_\u0585\u0563\u057d_\u057d\u057a\u057f_\u0570\u056f\u057f_\u0576\u0574\u0562_\u0564\u056f\u057f'.split('_');
        return monthsShort[m.month()];
    }
    function hy_am__weekdaysCaseReplace(m, format) {
        var weekdays = '\u056f\u056b\u0580\u0561\u056f\u056b_\u0565\u0580\u056f\u0578\u0582\u0577\u0561\u0562\u0569\u056b_\u0565\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b_\u0579\u0578\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b_\u0570\u056b\u0576\u0563\u0577\u0561\u0562\u0569\u056b_\u0578\u0582\u0580\u0562\u0561\u0569_\u0577\u0561\u0562\u0561\u0569'.split('_');
        return weekdays[m.day()];
    }
    var hy_am = _moment__default.defineLocale('hy-am', {
            months: hy_am__monthsCaseReplace,
            monthsShort: hy_am__monthsShortCaseReplace,
            weekdays: hy_am__weekdaysCaseReplace,
            weekdaysShort: '\u056f\u0580\u056f_\u0565\u0580\u056f_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split('_'),
            weekdaysMin: '\u056f\u0580\u056f_\u0565\u0580\u056f_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY \u0569.',
                LLL: 'D MMMM YYYY \u0569., HH:mm',
                LLLL: 'dddd, D MMMM YYYY \u0569., HH:mm'
            },
            calendar: {
                sameDay: '[\u0561\u0575\u057d\u0585\u0580] LT',
                nextDay: '[\u057e\u0561\u0572\u0568] LT',
                lastDay: '[\u0565\u0580\u0565\u056f] LT',
                nextWeek: function () {
                    return 'dddd [\u0585\u0580\u0568 \u056a\u0561\u0574\u0568] LT';
                },
                lastWeek: function () {
                    return '[\u0561\u0576\u0581\u0561\u056e] dddd [\u0585\u0580\u0568 \u056a\u0561\u0574\u0568] LT';
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \u0570\u0565\u057f\u0578',
                past: '%s \u0561\u057c\u0561\u057b',
                s: '\u0574\u056b \u0584\u0561\u0576\u056b \u057e\u0561\u0575\u0580\u056f\u0575\u0561\u0576',
                m: '\u0580\u0578\u057a\u0565',
                mm: '%d \u0580\u0578\u057a\u0565',
                h: '\u056a\u0561\u0574',
                hh: '%d \u056a\u0561\u0574',
                d: '\u0585\u0580',
                dd: '%d \u0585\u0580',
                M: '\u0561\u0574\u056b\u057d',
                MM: '%d \u0561\u0574\u056b\u057d',
                y: '\u057f\u0561\u0580\u056b',
                yy: '%d \u057f\u0561\u0580\u056b'
            },
            meridiemParse: /գիշերվա|առավոտվա|ցերեկվա|երեկոյան/,
            isPM: function (input) {
                return /^(ցերեկվա|երեկոյան)$/.test(input);
            },
            meridiem: function (hour) {
                if (hour < 4) {
                    return '\u0563\u056b\u0577\u0565\u0580\u057e\u0561';
                } else if (hour < 12) {
                    return '\u0561\u057c\u0561\u057e\u0578\u057f\u057e\u0561';
                } else if (hour < 17) {
                    return '\u0581\u0565\u0580\u0565\u056f\u057e\u0561';
                } else {
                    return '\u0565\u0580\u0565\u056f\u0578\u0575\u0561\u0576';
                }
            },
            ordinalParse: /\d{1,2}|\d{1,2}-(ին|րդ)/,
            ordinal: function (number, period) {
                switch (period) {
                case 'DDD':
                case 'w':
                case 'W':
                case 'DDDo':
                    if (number === 1) {
                        return number + '-\u056b\u0576';
                    }
                    return number + '-\u0580\u0564';
                default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Bahasa Indonesia (id)
    //! author : Mohammad Satrio Utomo : https://github.com/tyok
    //! reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan
    var id = _moment__default.defineLocale('id', {
            months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
            monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
            weekdays: 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
            weekdaysShort: 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
            weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm'
            },
            meridiemParse: /pagi|siang|sore|malam/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'pagi') {
                    return hour;
                } else if (meridiem === 'siang') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === 'sore' || meridiem === 'malam') {
                    return hour + 12;
                }
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours < 11) {
                    return 'pagi';
                } else if (hours < 15) {
                    return 'siang';
                } else if (hours < 19) {
                    return 'sore';
                } else {
                    return 'malam';
                }
            },
            calendar: {
                sameDay: '[Hari ini pukul] LT',
                nextDay: '[Besok pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kemarin pukul] LT',
                lastWeek: 'dddd [lalu pukul] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'dalam %s',
                past: '%s yang lalu',
                s: 'beberapa detik',
                m: 'semenit',
                mm: '%d menit',
                h: 'sejam',
                hh: '%d jam',
                d: 'sehari',
                dd: '%d hari',
                M: 'sebulan',
                MM: '%d bulan',
                y: 'setahun',
                yy: '%d tahun'
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : icelandic (is)
    //! author : Hinrik Örn Sigurðsson : https://github.com/hinrik
    function is__plural(n) {
        if (n % 100 === 11) {
            return true;
        } else if (n % 10 === 1) {
            return false;
        }
        return true;
    }
    function is__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nokkrar sek\xfandur' : 'nokkrum sek\xfandum';
        case 'm':
            return withoutSuffix ? 'm\xedn\xfata' : 'm\xedn\xfatu';
        case 'mm':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'm\xedn\xfatur' : 'm\xedn\xfatum');
            } else if (withoutSuffix) {
                return result + 'm\xedn\xfata';
            }
            return result + 'm\xedn\xfatu';
        case 'hh':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
            }
            return result + 'klukkustund';
        case 'd':
            if (withoutSuffix) {
                return 'dagur';
            }
            return isFuture ? 'dag' : 'degi';
        case 'dd':
            if (is__plural(number)) {
                if (withoutSuffix) {
                    return result + 'dagar';
                }
                return result + (isFuture ? 'daga' : 'd\xf6gum');
            } else if (withoutSuffix) {
                return result + 'dagur';
            }
            return result + (isFuture ? 'dag' : 'degi');
        case 'M':
            if (withoutSuffix) {
                return 'm\xe1nu\xf0ur';
            }
            return isFuture ? 'm\xe1nu\xf0' : 'm\xe1nu\xf0i';
        case 'MM':
            if (is__plural(number)) {
                if (withoutSuffix) {
                    return result + 'm\xe1nu\xf0ir';
                }
                return result + (isFuture ? 'm\xe1nu\xf0i' : 'm\xe1nu\xf0um');
            } else if (withoutSuffix) {
                return result + 'm\xe1nu\xf0ur';
            }
            return result + (isFuture ? 'm\xe1nu\xf0' : 'm\xe1nu\xf0i');
        case 'y':
            return withoutSuffix || isFuture ? '\xe1r' : '\xe1ri';
        case 'yy':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? '\xe1r' : '\xe1rum');
            }
            return result + (withoutSuffix || isFuture ? '\xe1r' : '\xe1ri');
        }
    }
    var is = _moment__default.defineLocale('is', {
            months: 'jan\xfaar_febr\xfaar_mars_apr\xedl_ma\xed_j\xfan\xed_j\xfal\xed_\xe1g\xfast_september_okt\xf3ber_n\xf3vember_desember'.split('_'),
            monthsShort: 'jan_feb_mar_apr_ma\xed_j\xfan_j\xfal_\xe1g\xfa_sep_okt_n\xf3v_des'.split('_'),
            weekdays: 'sunnudagur_m\xe1nudagur_\xferi\xf0judagur_mi\xf0vikudagur_fimmtudagur_f\xf6studagur_laugardagur'.split('_'),
            weekdaysShort: 'sun_m\xe1n_\xferi_mi\xf0_fim_f\xf6s_lau'.split('_'),
            weekdaysMin: 'Su_M\xe1_\xder_Mi_Fi_F\xf6_La'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY [kl.] H:mm',
                LLLL: 'dddd, D. MMMM YYYY [kl.] H:mm'
            },
            calendar: {
                sameDay: '[\xed dag kl.] LT',
                nextDay: '[\xe1 morgun kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[\xed g\xe6r kl.] LT',
                lastWeek: '[s\xed\xf0asta] dddd [kl.] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'eftir %s',
                past: 'fyrir %s s\xed\xf0an',
                s: is__translate,
                m: is__translate,
                mm: is__translate,
                h: 'klukkustund',
                hh: is__translate,
                d: is__translate,
                dd: is__translate,
                M: is__translate,
                MM: is__translate,
                y: is__translate,
                yy: is__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : italian (it)
    //! author : Lorenzo : https://github.com/aliem
    //! author: Mattia Larentis: https://github.com/nostalgiaz
    var it = _moment__default.defineLocale('it', {
            months: 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
            monthsShort: 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
            weekdays: 'Domenica_Luned\xec_Marted\xec_Mercoled\xec_Gioved\xec_Venerd\xec_Sabato'.split('_'),
            weekdaysShort: 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
            weekdaysMin: 'D_L_Ma_Me_G_V_S'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Oggi alle] LT',
                nextDay: '[Domani alle] LT',
                nextWeek: 'dddd [alle] LT',
                lastDay: '[Ieri alle] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[la scorsa] dddd [alle] LT';
                    default:
                        return '[lo scorso] dddd [alle] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: function (s) {
                    return (/^[0-9].+$/.test(s) ? 'tra' : 'in') + ' ' + s;
                },
                past: '%s fa',
                s: 'alcuni secondi',
                m: 'un minuto',
                mm: '%d minuti',
                h: "un'ora",
                hh: '%d ore',
                d: 'un giorno',
                dd: '%d giorni',
                M: 'un mese',
                MM: '%d mesi',
                y: 'un anno',
                yy: '%d anni'
            },
            ordinalParse: /\d{1,2}º/,
            ordinal: '%d\xba',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : japanese (ja)
    //! author : LI Long : https://github.com/baryon
    var ja = _moment__default.defineLocale('ja', {
            months: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
            monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
            weekdays: '\u65e5\u66dc\u65e5_\u6708\u66dc\u65e5_\u706b\u66dc\u65e5_\u6c34\u66dc\u65e5_\u6728\u66dc\u65e5_\u91d1\u66dc\u65e5_\u571f\u66dc\u65e5'.split('_'),
            weekdaysShort: '\u65e5_\u6708_\u706b_\u6c34_\u6728_\u91d1_\u571f'.split('_'),
            weekdaysMin: '\u65e5_\u6708_\u706b_\u6c34_\u6728_\u91d1_\u571f'.split('_'),
            longDateFormat: {
                LT: 'Ah\u6642m\u5206',
                LTS: 'Ah\u6642m\u5206s\u79d2',
                L: 'YYYY/MM/DD',
                LL: 'YYYY\u5e74M\u6708D\u65e5',
                LLL: 'YYYY\u5e74M\u6708D\u65e5Ah\u6642m\u5206',
                LLLL: 'YYYY\u5e74M\u6708D\u65e5Ah\u6642m\u5206 dddd'
            },
            meridiemParse: /午前|午後/i,
            isPM: function (input) {
                return input === '\u5348\u5f8c';
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 12) {
                    return '\u5348\u524d';
                } else {
                    return '\u5348\u5f8c';
                }
            },
            calendar: {
                sameDay: '[\u4eca\u65e5] LT',
                nextDay: '[\u660e\u65e5] LT',
                nextWeek: '[\u6765\u9031]dddd LT',
                lastDay: '[\u6628\u65e5] LT',
                lastWeek: '[\u524d\u9031]dddd LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s\u5f8c',
                past: '%s\u524d',
                s: '\u6570\u79d2',
                m: '1\u5206',
                mm: '%d\u5206',
                h: '1\u6642\u9593',
                hh: '%d\u6642\u9593',
                d: '1\u65e5',
                dd: '%d\u65e5',
                M: '1\u30f6\u6708',
                MM: '%d\u30f6\u6708',
                y: '1\u5e74',
                yy: '%d\u5e74'
            }
        });
    //! moment.js locale configuration
    //! locale : Boso Jowo (jv)
    //! author : Rony Lantip : https://github.com/lantip
    //! reference: http://jv.wikipedia.org/wiki/Basa_Jawa
    var jv = _moment__default.defineLocale('jv', {
            months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_Nopember_Desember'.split('_'),
            monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nop_Des'.split('_'),
            weekdays: 'Minggu_Senen_Seloso_Rebu_Kemis_Jemuwah_Septu'.split('_'),
            weekdaysShort: 'Min_Sen_Sel_Reb_Kem_Jem_Sep'.split('_'),
            weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sp'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm'
            },
            meridiemParse: /enjing|siyang|sonten|ndalu/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'enjing') {
                    return hour;
                } else if (meridiem === 'siyang') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === 'sonten' || meridiem === 'ndalu') {
                    return hour + 12;
                }
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours < 11) {
                    return 'enjing';
                } else if (hours < 15) {
                    return 'siyang';
                } else if (hours < 19) {
                    return 'sonten';
                } else {
                    return 'ndalu';
                }
            },
            calendar: {
                sameDay: '[Dinten puniko pukul] LT',
                nextDay: '[Mbenjang pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kala wingi pukul] LT',
                lastWeek: 'dddd [kepengker pukul] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'wonten ing %s',
                past: '%s ingkang kepengker',
                s: 'sawetawis detik',
                m: 'setunggal menit',
                mm: '%d menit',
                h: 'setunggal jam',
                hh: '%d jam',
                d: 'sedinten',
                dd: '%d dinten',
                M: 'sewulan',
                MM: '%d wulan',
                y: 'setaun',
                yy: '%d taun'
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Georgian (ka)
    //! author : Irakli Janiashvili : https://github.com/irakli-janiashvili
    function ka__monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u10d8\u10d0\u10dc\u10d5\u10d0\u10e0\u10d8_\u10d7\u10d4\u10d1\u10d4\u10e0\u10d5\u10d0\u10da\u10d8_\u10db\u10d0\u10e0\u10e2\u10d8_\u10d0\u10de\u10e0\u10d8\u10da\u10d8_\u10db\u10d0\u10d8\u10e1\u10d8_\u10d8\u10d5\u10dc\u10d8\u10e1\u10d8_\u10d8\u10d5\u10da\u10d8\u10e1\u10d8_\u10d0\u10d2\u10d5\u10d8\u10e1\u10e2\u10dd_\u10e1\u10d4\u10e5\u10e2\u10d4\u10db\u10d1\u10d4\u10e0\u10d8_\u10dd\u10e5\u10e2\u10dd\u10db\u10d1\u10d4\u10e0\u10d8_\u10dc\u10dd\u10d4\u10db\u10d1\u10d4\u10e0\u10d8_\u10d3\u10d4\u10d9\u10d4\u10db\u10d1\u10d4\u10e0\u10d8'.split('_'),
                'accusative': '\u10d8\u10d0\u10dc\u10d5\u10d0\u10e0\u10e1_\u10d7\u10d4\u10d1\u10d4\u10e0\u10d5\u10d0\u10da\u10e1_\u10db\u10d0\u10e0\u10e2\u10e1_\u10d0\u10de\u10e0\u10d8\u10da\u10d8\u10e1_\u10db\u10d0\u10d8\u10e1\u10e1_\u10d8\u10d5\u10dc\u10d8\u10e1\u10e1_\u10d8\u10d5\u10da\u10d8\u10e1\u10e1_\u10d0\u10d2\u10d5\u10d8\u10e1\u10e2\u10e1_\u10e1\u10d4\u10e5\u10e2\u10d4\u10db\u10d1\u10d4\u10e0\u10e1_\u10dd\u10e5\u10e2\u10dd\u10db\u10d1\u10d4\u10e0\u10e1_\u10dc\u10dd\u10d4\u10db\u10d1\u10d4\u10e0\u10e1_\u10d3\u10d4\u10d9\u10d4\u10db\u10d1\u10d4\u10e0\u10e1'.split('_')
            }, nounCase = /D[oD] *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function ka__weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u10d9\u10d5\u10d8\u10e0\u10d0_\u10dd\u10e0\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10e1\u10d0\u10db\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10dd\u10d7\u10ee\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10ee\u10e3\u10d7\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10de\u10d0\u10e0\u10d0\u10e1\u10d9\u10d4\u10d5\u10d8_\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8'.split('_'),
                'accusative': '\u10d9\u10d5\u10d8\u10e0\u10d0\u10e1_\u10dd\u10e0\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10e1\u10d0\u10db\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10dd\u10d7\u10ee\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10ee\u10e3\u10d7\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10de\u10d0\u10e0\u10d0\u10e1\u10d9\u10d4\u10d5\u10e1_\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1'.split('_')
            }, nounCase = /(წინა|შემდეგ)/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    var ka = _moment__default.defineLocale('ka', {
            months: ka__monthsCaseReplace,
            monthsShort: '\u10d8\u10d0\u10dc_\u10d7\u10d4\u10d1_\u10db\u10d0\u10e0_\u10d0\u10de\u10e0_\u10db\u10d0\u10d8_\u10d8\u10d5\u10dc_\u10d8\u10d5\u10da_\u10d0\u10d2\u10d5_\u10e1\u10d4\u10e5_\u10dd\u10e5\u10e2_\u10dc\u10dd\u10d4_\u10d3\u10d4\u10d9'.split('_'),
            weekdays: ka__weekdaysCaseReplace,
            weekdaysShort: '\u10d9\u10d5\u10d8_\u10dd\u10e0\u10e8_\u10e1\u10d0\u10db_\u10dd\u10d7\u10ee_\u10ee\u10e3\u10d7_\u10de\u10d0\u10e0_\u10e8\u10d0\u10d1'.split('_'),
            weekdaysMin: '\u10d9\u10d5_\u10dd\u10e0_\u10e1\u10d0_\u10dd\u10d7_\u10ee\u10e3_\u10de\u10d0_\u10e8\u10d0'.split('_'),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A'
            },
            calendar: {
                sameDay: '[\u10d3\u10e6\u10d4\u10e1] LT[-\u10d6\u10d4]',
                nextDay: '[\u10ee\u10d5\u10d0\u10da] LT[-\u10d6\u10d4]',
                lastDay: '[\u10d2\u10e3\u10e8\u10d8\u10dc] LT[-\u10d6\u10d4]',
                nextWeek: '[\u10e8\u10d4\u10db\u10d3\u10d4\u10d2] dddd LT[-\u10d6\u10d4]',
                lastWeek: '[\u10ec\u10d8\u10dc\u10d0] dddd LT-\u10d6\u10d4',
                sameElse: 'L'
            },
            relativeTime: {
                future: function (s) {
                    return /(წამი|წუთი|საათი|წელი)/.test(s) ? s.replace(/ი$/, '\u10e8\u10d8') : s + '\u10e8\u10d8';
                },
                past: function (s) {
                    if (/(წამი|წუთი|საათი|დღე|თვე)/.test(s)) {
                        return s.replace(/(ი|ე)$/, '\u10d8\u10e1 \u10ec\u10d8\u10dc');
                    }
                    if (/წელი/.test(s)) {
                        return s.replace(/წელი$/, '\u10ec\u10da\u10d8\u10e1 \u10ec\u10d8\u10dc');
                    }
                },
                s: '\u10e0\u10d0\u10db\u10d3\u10d4\u10dc\u10d8\u10db\u10d4 \u10ec\u10d0\u10db\u10d8',
                m: '\u10ec\u10e3\u10d7\u10d8',
                mm: '%d \u10ec\u10e3\u10d7\u10d8',
                h: '\u10e1\u10d0\u10d0\u10d7\u10d8',
                hh: '%d \u10e1\u10d0\u10d0\u10d7\u10d8',
                d: '\u10d3\u10e6\u10d4',
                dd: '%d \u10d3\u10e6\u10d4',
                M: '\u10d7\u10d5\u10d4',
                MM: '%d \u10d7\u10d5\u10d4',
                y: '\u10ec\u10d4\u10da\u10d8',
                yy: '%d \u10ec\u10d4\u10da\u10d8'
            },
            ordinalParse: /0|1-ლი|მე-\d{1,2}|\d{1,2}-ე/,
            ordinal: function (number) {
                if (number === 0) {
                    return number;
                }
                if (number === 1) {
                    return number + '-\u10da\u10d8';
                }
                if (number < 20 || number <= 100 && number % 20 === 0 || number % 100 === 0) {
                    return '\u10db\u10d4-' + number;
                }
                return number + '-\u10d4';
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : khmer (km)
    //! author : Kruy Vanna : https://github.com/kruyvanna
    var km = _moment__default.defineLocale('km', {
            months: '\u1798\u1780\u179a\u17b6_\u1780\u17bb\u1798\u17d2\u1797\u17c8_\u1798\u17b7\u1793\u17b6_\u1798\u17c1\u179f\u17b6_\u17a7\u179f\u1797\u17b6_\u1798\u17b7\u1790\u17bb\u1793\u17b6_\u1780\u1780\u17d2\u1780\u178a\u17b6_\u179f\u17b8\u17a0\u17b6_\u1780\u1789\u17d2\u1789\u17b6_\u178f\u17bb\u179b\u17b6_\u179c\u17b7\u1785\u17d2\u1786\u17b7\u1780\u17b6_\u1792\u17d2\u1793\u17bc'.split('_'),
            monthsShort: '\u1798\u1780\u179a\u17b6_\u1780\u17bb\u1798\u17d2\u1797\u17c8_\u1798\u17b7\u1793\u17b6_\u1798\u17c1\u179f\u17b6_\u17a7\u179f\u1797\u17b6_\u1798\u17b7\u1790\u17bb\u1793\u17b6_\u1780\u1780\u17d2\u1780\u178a\u17b6_\u179f\u17b8\u17a0\u17b6_\u1780\u1789\u17d2\u1789\u17b6_\u178f\u17bb\u179b\u17b6_\u179c\u17b7\u1785\u17d2\u1786\u17b7\u1780\u17b6_\u1792\u17d2\u1793\u17bc'.split('_'),
            weekdays: '\u17a2\u17b6\u1791\u17b7\u178f\u17d2\u1799_\u1785\u17d0\u1793\u17d2\u1791_\u17a2\u1784\u17d2\u1782\u17b6\u179a_\u1796\u17bb\u1792_\u1796\u17d2\u179a\u17a0\u179f\u17d2\u1794\u178f\u17b7\u17cd_\u179f\u17bb\u1780\u17d2\u179a_\u179f\u17c5\u179a\u17cd'.split('_'),
            weekdaysShort: '\u17a2\u17b6\u1791\u17b7\u178f\u17d2\u1799_\u1785\u17d0\u1793\u17d2\u1791_\u17a2\u1784\u17d2\u1782\u17b6\u179a_\u1796\u17bb\u1792_\u1796\u17d2\u179a\u17a0\u179f\u17d2\u1794\u178f\u17b7\u17cd_\u179f\u17bb\u1780\u17d2\u179a_\u179f\u17c5\u179a\u17cd'.split('_'),
            weekdaysMin: '\u17a2\u17b6\u1791\u17b7\u178f\u17d2\u1799_\u1785\u17d0\u1793\u17d2\u1791_\u17a2\u1784\u17d2\u1782\u17b6\u179a_\u1796\u17bb\u1792_\u1796\u17d2\u179a\u17a0\u179f\u17d2\u1794\u178f\u17b7\u17cd_\u179f\u17bb\u1780\u17d2\u179a_\u179f\u17c5\u179a\u17cd'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[\u1790\u17d2\u1784\u17c3\u1793\u17c8 \u1798\u17c9\u17c4\u1784] LT',
                nextDay: '[\u179f\u17d2\u17a2\u17c2\u1780 \u1798\u17c9\u17c4\u1784] LT',
                nextWeek: 'dddd [\u1798\u17c9\u17c4\u1784] LT',
                lastDay: '[\u1798\u17d2\u179f\u17b7\u179b\u1798\u17b7\u1789 \u1798\u17c9\u17c4\u1784] LT',
                lastWeek: 'dddd [\u179f\u1794\u17d2\u178f\u17b6\u17a0\u17cd\u1798\u17bb\u1793] [\u1798\u17c9\u17c4\u1784] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s\u1791\u17c0\u178f',
                past: '%s\u1798\u17bb\u1793',
                s: '\u1794\u17c9\u17bb\u1793\u17d2\u1798\u17b6\u1793\u179c\u17b7\u1793\u17b6\u1791\u17b8',
                m: '\u1798\u17bd\u1799\u1793\u17b6\u1791\u17b8',
                mm: '%d \u1793\u17b6\u1791\u17b8',
                h: '\u1798\u17bd\u1799\u1798\u17c9\u17c4\u1784',
                hh: '%d \u1798\u17c9\u17c4\u1784',
                d: '\u1798\u17bd\u1799\u1790\u17d2\u1784\u17c3',
                dd: '%d \u1790\u17d2\u1784\u17c3',
                M: '\u1798\u17bd\u1799\u1781\u17c2',
                MM: '%d \u1781\u17c2',
                y: '\u1798\u17bd\u1799\u1786\u17d2\u1793\u17b6\u17c6',
                yy: '%d \u1786\u17d2\u1793\u17b6\u17c6'
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : korean (ko)
    //!
    //! authors
    //!
    //! - Kyungwook, Park : https://github.com/kyungw00k
    //! - Jeeeyul Lee <jeeeyul@gmail.com>
    var ko = _moment__default.defineLocale('ko', {
            months: '1\uc6d4_2\uc6d4_3\uc6d4_4\uc6d4_5\uc6d4_6\uc6d4_7\uc6d4_8\uc6d4_9\uc6d4_10\uc6d4_11\uc6d4_12\uc6d4'.split('_'),
            monthsShort: '1\uc6d4_2\uc6d4_3\uc6d4_4\uc6d4_5\uc6d4_6\uc6d4_7\uc6d4_8\uc6d4_9\uc6d4_10\uc6d4_11\uc6d4_12\uc6d4'.split('_'),
            weekdays: '\uc77c\uc694\uc77c_\uc6d4\uc694\uc77c_\ud654\uc694\uc77c_\uc218\uc694\uc77c_\ubaa9\uc694\uc77c_\uae08\uc694\uc77c_\ud1a0\uc694\uc77c'.split('_'),
            weekdaysShort: '\uc77c_\uc6d4_\ud654_\uc218_\ubaa9_\uae08_\ud1a0'.split('_'),
            weekdaysMin: '\uc77c_\uc6d4_\ud654_\uc218_\ubaa9_\uae08_\ud1a0'.split('_'),
            longDateFormat: {
                LT: 'A h\uc2dc m\ubd84',
                LTS: 'A h\uc2dc m\ubd84 s\ucd08',
                L: 'YYYY.MM.DD',
                LL: 'YYYY\ub144 MMMM D\uc77c',
                LLL: 'YYYY\ub144 MMMM D\uc77c A h\uc2dc m\ubd84',
                LLLL: 'YYYY\ub144 MMMM D\uc77c dddd A h\uc2dc m\ubd84'
            },
            calendar: {
                sameDay: '\uc624\ub298 LT',
                nextDay: '\ub0b4\uc77c LT',
                nextWeek: 'dddd LT',
                lastDay: '\uc5b4\uc81c LT',
                lastWeek: '\uc9c0\ub09c\uc8fc dddd LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \ud6c4',
                past: '%s \uc804',
                s: '\uba87\ucd08',
                ss: '%d\ucd08',
                m: '\uc77c\ubd84',
                mm: '%d\ubd84',
                h: '\ud55c\uc2dc\uac04',
                hh: '%d\uc2dc\uac04',
                d: '\ud558\ub8e8',
                dd: '%d\uc77c',
                M: '\ud55c\ub2ec',
                MM: '%d\ub2ec',
                y: '\uc77c\ub144',
                yy: '%d\ub144'
            },
            ordinalParse: /\d{1,2}일/,
            ordinal: '%d\uc77c',
            meridiemParse: /오전|오후/,
            isPM: function (token) {
                return token === '\uc624\ud6c4';
            },
            meridiem: function (hour, minute, isUpper) {
                return hour < 12 ? '\uc624\uc804' : '\uc624\ud6c4';
            }
        });
    //! moment.js locale configuration
    //! locale : Luxembourgish (lb)
    //! author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz
    function lb__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
                'm': [
                    'eng Minutt',
                    'enger Minutt'
                ],
                'h': [
                    'eng Stonn',
                    'enger Stonn'
                ],
                'd': [
                    'een Dag',
                    'engem Dag'
                ],
                'M': [
                    'ee Mount',
                    'engem Mount'
                ],
                'y': [
                    'ee Joer',
                    'engem Joer'
                ]
            };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    function processFutureTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'a ' + string;
        }
        return 'an ' + string;
    }
    function processPastTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'viru ' + string;
        }
        return 'virun ' + string;
    }
    /**
     * Returns true if the word before the given number loses the '-n' ending.
     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
     *
     * @param number {integer}
     * @returns {boolean}
     */
    function eifelerRegelAppliesToNumber(number) {
        number = parseInt(number, 10);
        if (isNaN(number)) {
            return false;
        }
        if (number < 0) {
            // Negative Number --> always true
            return true;
        } else if (number < 10) {
            // Only 1 digit
            if (4 <= number && number <= 7) {
                return true;
            }
            return false;
        } else if (number < 100) {
            // 2 digits
            var lastDigit = number % 10, firstDigit = number / 10;
            if (lastDigit === 0) {
                return eifelerRegelAppliesToNumber(firstDigit);
            }
            return eifelerRegelAppliesToNumber(lastDigit);
        } else if (number < 10000) {
            // 3 or 4 digits --> recursively check first digit
            while (number >= 10) {
                number = number / 10;
            }
            return eifelerRegelAppliesToNumber(number);
        } else {
            // Anything larger than 4 digits: recursively check first n-3 digits
            number = number / 1000;
            return;
        }
    }
    var lb = _moment__default.defineLocale('lb', {
            months: 'Januar_Februar_M\xe4erz_Abr\xebll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
            monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
            weekdays: 'Sonndeg_M\xe9indeg_D\xebnschdeg_M\xebttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
            weekdaysShort: 'So._M\xe9._D\xeb._M\xeb._Do._Fr._Sa.'.split('_'),
            weekdaysMin: 'So_M\xe9_D\xeb_M\xeb_Do_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'H:mm [Auer]',
                LTS: 'H:mm:ss [Auer]',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm [Auer]',
                LLLL: 'dddd, D. MMMM YYYY H:mm [Auer]'
            },
            calendar: {
                sameDay: '[Haut um] LT',
                sameElse: 'L',
                nextDay: '[Muer um] LT',
                nextWeek: 'dddd [um] LT',
                lastDay: '[G\xebschter um] LT',
                lastWeek: function () {
                    // Different date string for 'Dënschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
                    switch (this.day()) {
                    case 2:
                    case 4:
                        return '[Leschten] dddd [um] LT';
                    default:
                        return '[Leschte] dddd [um] LT';
                    }
                }
            },
            relativeTime: {
                future: processFutureTime,
                past: processPastTime,
                s: 'e puer Sekonnen',
                m: lb__processRelativeTime,
                mm: '%d Minutten',
                h: lb__processRelativeTime,
                hh: '%d Stonnen',
                d: lb__processRelativeTime,
                dd: '%d Deeg',
                M: lb__processRelativeTime,
                MM: '%d M\xe9int',
                y: lb__processRelativeTime,
                yy: '%d Joer'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : Lithuanian (lt)
    //! author : Mindaugas Mozūras : https://github.com/mmozuras
    var lt__units = {
            'm': 'minut\u0117_minut\u0117s_minut\u0119',
            'mm': 'minut\u0117s_minu\u010di\u0173_minutes',
            'h': 'valanda_valandos_valand\u0105',
            'hh': 'valandos_valand\u0173_valandas',
            'd': 'diena_dienos_dien\u0105',
            'dd': 'dienos_dien\u0173_dienas',
            'M': 'm\u0117nuo_m\u0117nesio_m\u0117nes\u012f',
            'MM': 'm\u0117nesiai_m\u0117nesi\u0173_m\u0117nesius',
            'y': 'metai_met\u0173_metus',
            'yy': 'metai_met\u0173_metus'
        }, weekDays = 'sekmadienis_pirmadienis_antradienis_tre\u010diadienis_ketvirtadienis_penktadienis_\u0161e\u0161tadienis'.split('_');
    function translateSeconds(number, withoutSuffix, key, isFuture) {
        if (withoutSuffix) {
            return 'kelios sekund\u0117s';
        } else {
            return isFuture ? 'keli\u0173 sekund\u017ei\u0173' : 'kelias sekundes';
        }
    }
    function lt__monthsCaseReplace(m, format) {
        var months = {
                'nominative': 'sausis_vasaris_kovas_balandis_gegu\u017e\u0117_bir\u017eelis_liepa_rugpj\u016btis_rugs\u0117jis_spalis_lapkritis_gruodis'.split('_'),
                'accusative': 'sausio_vasario_kovo_baland\u017eio_gegu\u017e\u0117s_bir\u017eelio_liepos_rugpj\u016b\u010dio_rugs\u0117jo_spalio_lapkri\u010dio_gruod\u017eio'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function translateSingular(number, withoutSuffix, key, isFuture) {
        return withoutSuffix ? forms(key)[0] : isFuture ? forms(key)[1] : forms(key)[2];
    }
    function special(number) {
        return number % 10 === 0 || number > 10 && number < 20;
    }
    function forms(key) {
        return lt__units[key].split('_');
    }
    function lt__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        if (number === 1) {
            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
        } else if (withoutSuffix) {
            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
        } else {
            if (isFuture) {
                return result + forms(key)[1];
            } else {
                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
            }
        }
    }
    function relativeWeekDay(moment, format) {
        var nominative = format.indexOf('dddd HH:mm') === -1, weekDay = weekDays[moment.day()];
        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + '\u012f';
    }
    var lt = _moment__default.defineLocale('lt', {
            months: lt__monthsCaseReplace,
            monthsShort: 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
            weekdays: relativeWeekDay,
            weekdaysShort: 'Sek_Pir_Ant_Tre_Ket_Pen_\u0160e\u0161'.split('_'),
            weekdaysMin: 'S_P_A_T_K_Pn_\u0160'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'YYYY [m.] MMMM D [d.]',
                LLL: 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
                LLLL: 'YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]',
                l: 'YYYY-MM-DD',
                ll: 'YYYY [m.] MMMM D [d.]',
                lll: 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
                llll: 'YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]'
            },
            calendar: {
                sameDay: '[\u0160iandien] LT',
                nextDay: '[Rytoj] LT',
                nextWeek: 'dddd LT',
                lastDay: '[Vakar] LT',
                lastWeek: '[Pra\u0117jus\u012f] dddd LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'po %s',
                past: 'prie\u0161 %s',
                s: translateSeconds,
                m: translateSingular,
                mm: lt__translate,
                h: translateSingular,
                hh: lt__translate,
                d: translateSingular,
                dd: lt__translate,
                M: translateSingular,
                MM: lt__translate,
                y: translateSingular,
                yy: lt__translate
            },
            ordinalParse: /\d{1,2}-oji/,
            ordinal: function (number) {
                return number + '-oji';
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : latvian (lv)
    //! author : Kristaps Karlsons : https://github.com/skakri
    //! author : Jānis Elmeris : https://github.com/JanisE
    var lv__units = {
            'm': 'min\u016btes_min\u016bt\u0113m_min\u016bte_min\u016btes'.split('_'),
            'mm': 'min\u016btes_min\u016bt\u0113m_min\u016bte_min\u016btes'.split('_'),
            'h': 'stundas_stund\u0101m_stunda_stundas'.split('_'),
            'hh': 'stundas_stund\u0101m_stunda_stundas'.split('_'),
            'd': 'dienas_dien\u0101m_diena_dienas'.split('_'),
            'dd': 'dienas_dien\u0101m_diena_dienas'.split('_'),
            'M': 'm\u0113ne\u0161a_m\u0113ne\u0161iem_m\u0113nesis_m\u0113ne\u0161i'.split('_'),
            'MM': 'm\u0113ne\u0161a_m\u0113ne\u0161iem_m\u0113nesis_m\u0113ne\u0161i'.split('_'),
            'y': 'gada_gadiem_gads_gadi'.split('_'),
            'yy': 'gada_gadiem_gads_gadi'.split('_')
        };
    /**
     * @param withoutSuffix boolean true = a length of time; false = before/after a period of time.
     */
    function lv__format(forms, number, withoutSuffix) {
        if (withoutSuffix) {
            // E.g. "21 minūte", "3 minūtes".
            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
            // E.g. "21 minūtes" as in "pēc 21 minūtes".
            // E.g. "3 minūtēm" as in "pēc 3 minūtēm".
            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
    }
    function lv__relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + lv__format(lv__units[key], number, withoutSuffix);
    }
    function relativeTimeWithSingular(number, withoutSuffix, key) {
        return lv__format(lv__units[key], number, withoutSuffix);
    }
    function relativeSeconds(number, withoutSuffix) {
        return withoutSuffix ? 'da\u017eas sekundes' : 'da\u017e\u0101m sekund\u0113m';
    }
    var lv = _moment__default.defineLocale('lv', {
            months: 'janv\u0101ris_febru\u0101ris_marts_apr\u012blis_maijs_j\u016bnijs_j\u016blijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
            monthsShort: 'jan_feb_mar_apr_mai_j\u016bn_j\u016bl_aug_sep_okt_nov_dec'.split('_'),
            weekdays: 'sv\u0113tdiena_pirmdiena_otrdiena_tre\u0161diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
            weekdaysShort: 'Sv_P_O_T_C_Pk_S'.split('_'),
            weekdaysMin: 'Sv_P_O_T_C_Pk_S'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY.',
                LL: 'YYYY. [gada] D. MMMM',
                LLL: 'YYYY. [gada] D. MMMM, HH:mm',
                LLLL: 'YYYY. [gada] D. MMMM, dddd, HH:mm'
            },
            calendar: {
                sameDay: '[\u0160odien pulksten] LT',
                nextDay: '[R\u012bt pulksten] LT',
                nextWeek: 'dddd [pulksten] LT',
                lastDay: '[Vakar pulksten] LT',
                lastWeek: '[Pag\u0101ju\u0161\u0101] dddd [pulksten] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'p\u0113c %s',
                past: 'pirms %s',
                s: relativeSeconds,
                m: relativeTimeWithSingular,
                mm: lv__relativeTimeWithPlural,
                h: relativeTimeWithSingular,
                hh: lv__relativeTimeWithPlural,
                d: relativeTimeWithSingular,
                dd: lv__relativeTimeWithPlural,
                M: relativeTimeWithSingular,
                MM: lv__relativeTimeWithPlural,
                y: relativeTimeWithSingular,
                yy: lv__relativeTimeWithPlural
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : Montenegrin (me)
    //! author : Miodrag Nikač <miodrag@restartit.me> : https://github.com/miodragnikac
    var me__translator = {
            words: {
                m: [
                    'jedan minut',
                    'jednog minuta'
                ],
                mm: [
                    'minut',
                    'minuta',
                    'minuta'
                ],
                h: [
                    'jedan sat',
                    'jednog sata'
                ],
                hh: [
                    'sat',
                    'sata',
                    'sati'
                ],
                dd: [
                    'dan',
                    'dana',
                    'dana'
                ],
                MM: [
                    'mjesec',
                    'mjeseca',
                    'mjeseci'
                ],
                yy: [
                    'godina',
                    'godine',
                    'godina'
                ]
            },
            correctGrammaticalCase: function (number, wordKey) {
                return number === 1 ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
            },
            translate: function (number, withoutSuffix, key) {
                var wordKey = me__translator.words[key];
                if (key.length === 1) {
                    return withoutSuffix ? wordKey[0] : wordKey[1];
                } else {
                    return number + ' ' + me__translator.correctGrammaticalCase(number, wordKey);
                }
            }
        };
    var me = _moment__default.defineLocale('me', {
            months: [
                'januar',
                'februar',
                'mart',
                'april',
                'maj',
                'jun',
                'jul',
                'avgust',
                'septembar',
                'oktobar',
                'novembar',
                'decembar'
            ],
            monthsShort: [
                'jan.',
                'feb.',
                'mar.',
                'apr.',
                'maj',
                'jun',
                'jul',
                'avg.',
                'sep.',
                'okt.',
                'nov.',
                'dec.'
            ],
            weekdays: [
                'nedjelja',
                'ponedjeljak',
                'utorak',
                'srijeda',
                '\u010detvrtak',
                'petak',
                'subota'
            ],
            weekdaysShort: [
                'ned.',
                'pon.',
                'uto.',
                'sri.',
                '\u010det.',
                'pet.',
                'sub.'
            ],
            weekdaysMin: [
                'ne',
                'po',
                'ut',
                'sr',
                '\u010de',
                'pe',
                'su'
            ],
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[danas u] LT',
                nextDay: '[sjutra u] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[u] [nedjelju] [u] LT';
                    case 3:
                        return '[u] [srijedu] [u] LT';
                    case 6:
                        return '[u] [subotu] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[u] dddd [u] LT';
                    }
                },
                lastDay: '[ju\u010de u] LT',
                lastWeek: function () {
                    var lastWeekDays = [
                            '[pro\u0161le] [nedjelje] [u] LT',
                            '[pro\u0161log] [ponedjeljka] [u] LT',
                            '[pro\u0161log] [utorka] [u] LT',
                            '[pro\u0161le] [srijede] [u] LT',
                            '[pro\u0161log] [\u010detvrtka] [u] LT',
                            '[pro\u0161log] [petka] [u] LT',
                            '[pro\u0161le] [subote] [u] LT'
                        ];
                    return lastWeekDays[this.day()];
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: 'prije %s',
                s: 'nekoliko sekundi',
                m: me__translator.translate,
                mm: me__translator.translate,
                h: me__translator.translate,
                hh: me__translator.translate,
                d: 'dan',
                dd: me__translator.translate,
                M: 'mjesec',
                MM: me__translator.translate,
                y: 'godinu',
                yy: me__translator.translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : macedonian (mk)
    //! author : Borislav Mickov : https://github.com/B0k0
    var mk = _moment__default.defineLocale('mk', {
            months: '\u0458\u0430\u043d\u0443\u0430\u0440\u0438_\u0444\u0435\u0432\u0440\u0443\u0430\u0440\u0438_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0438\u043b_\u043c\u0430\u0458_\u0458\u0443\u043d\u0438_\u0458\u0443\u043b\u0438_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043f\u0442\u0435\u043c\u0432\u0440\u0438_\u043e\u043a\u0442\u043e\u043c\u0432\u0440\u0438_\u043d\u043e\u0435\u043c\u0432\u0440\u0438_\u0434\u0435\u043a\u0435\u043c\u0432\u0440\u0438'.split('_'),
            monthsShort: '\u0458\u0430\u043d_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0458_\u0458\u0443\u043d_\u0458\u0443\u043b_\u0430\u0432\u0433_\u0441\u0435\u043f_\u043e\u043a\u0442_\u043d\u043e\u0435_\u0434\u0435\u043a'.split('_'),
            weekdays: '\u043d\u0435\u0434\u0435\u043b\u0430_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0440\u0442\u043e\u043a_\u043f\u0435\u0442\u043e\u043a_\u0441\u0430\u0431\u043e\u0442\u0430'.split('_'),
            weekdaysShort: '\u043d\u0435\u0434_\u043f\u043e\u043d_\u0432\u0442\u043e_\u0441\u0440\u0435_\u0447\u0435\u0442_\u043f\u0435\u0442_\u0441\u0430\u0431'.split('_'),
            weekdaysMin: '\u043de_\u043fo_\u0432\u0442_\u0441\u0440_\u0447\u0435_\u043f\u0435_\u0441a'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'D.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd, D MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[\u0414\u0435\u043d\u0435\u0441 \u0432\u043e] LT',
                nextDay: '[\u0423\u0442\u0440\u0435 \u0432\u043e] LT',
                nextWeek: 'dddd [\u0432\u043e] LT',
                lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432\u043e] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                    case 3:
                    case 6:
                        return '[\u0412\u043e \u0438\u0437\u043c\u0438\u043d\u0430\u0442\u0430\u0442\u0430] dddd [\u0432\u043e] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[\u0412\u043e \u0438\u0437\u043c\u0438\u043d\u0430\u0442\u0438\u043e\u0442] dddd [\u0432\u043e] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u043f\u043e\u0441\u043b\u0435 %s',
                past: '\u043f\u0440\u0435\u0434 %s',
                s: '\u043d\u0435\u043a\u043e\u043b\u043a\u0443 \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
                m: '\u043c\u0438\u043d\u0443\u0442\u0430',
                mm: '%d \u043c\u0438\u043d\u0443\u0442\u0438',
                h: '\u0447\u0430\u0441',
                hh: '%d \u0447\u0430\u0441\u0430',
                d: '\u0434\u0435\u043d',
                dd: '%d \u0434\u0435\u043d\u0430',
                M: '\u043c\u0435\u0441\u0435\u0446',
                MM: '%d \u043c\u0435\u0441\u0435\u0446\u0438',
                y: '\u0433\u043e\u0434\u0438\u043d\u0430',
                yy: '%d \u0433\u043e\u0434\u0438\u043d\u0438'
            },
            ordinalParse: /\d{1,2}-(ев|ен|ти|ви|ри|ми)/,
            ordinal: function (number) {
                var lastDigit = number % 10, last2Digits = number % 100;
                if (number === 0) {
                    return number + '-\u0435\u0432';
                } else if (last2Digits === 0) {
                    return number + '-\u0435\u043d';
                } else if (last2Digits > 10 && last2Digits < 20) {
                    return number + '-\u0442\u0438';
                } else if (lastDigit === 1) {
                    return number + '-\u0432\u0438';
                } else if (lastDigit === 2) {
                    return number + '-\u0440\u0438';
                } else if (lastDigit === 7 || lastDigit === 8) {
                    return number + '-\u043c\u0438';
                } else {
                    return number + '-\u0442\u0438';
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : malayalam (ml)
    //! author : Floyd Pink : https://github.com/floydpink
    var ml = _moment__default.defineLocale('ml', {
            months: '\u0d1c\u0d28\u0d41\u0d35\u0d30\u0d3f_\u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41\u0d35\u0d30\u0d3f_\u0d2e\u0d3e\u0d7c\u0d1a\u0d4d\u0d1a\u0d4d_\u0d0f\u0d2a\u0d4d\u0d30\u0d3f\u0d7d_\u0d2e\u0d47\u0d2f\u0d4d_\u0d1c\u0d42\u0d7a_\u0d1c\u0d42\u0d32\u0d48_\u0d13\u0d17\u0d38\u0d4d\u0d31\u0d4d\u0d31\u0d4d_\u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31\u0d02\u0d2c\u0d7c_\u0d12\u0d15\u0d4d\u0d1f\u0d4b\u0d2c\u0d7c_\u0d28\u0d35\u0d02\u0d2c\u0d7c_\u0d21\u0d3f\u0d38\u0d02\u0d2c\u0d7c'.split('_'),
            monthsShort: '\u0d1c\u0d28\u0d41._\u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41._\u0d2e\u0d3e\u0d7c._\u0d0f\u0d2a\u0d4d\u0d30\u0d3f._\u0d2e\u0d47\u0d2f\u0d4d_\u0d1c\u0d42\u0d7a_\u0d1c\u0d42\u0d32\u0d48._\u0d13\u0d17._\u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31._\u0d12\u0d15\u0d4d\u0d1f\u0d4b._\u0d28\u0d35\u0d02._\u0d21\u0d3f\u0d38\u0d02.'.split('_'),
            weekdays: '\u0d1e\u0d3e\u0d2f\u0d31\u0d3e\u0d34\u0d4d\u0d1a_\u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d33\u0d3e\u0d34\u0d4d\u0d1a_\u0d1a\u0d4a\u0d35\u0d4d\u0d35\u0d3e\u0d34\u0d4d\u0d1a_\u0d2c\u0d41\u0d27\u0d28\u0d3e\u0d34\u0d4d\u0d1a_\u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d3e\u0d34\u0d4d\u0d1a_\u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u0d1a_\u0d36\u0d28\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u0d1a'.split('_'),
            weekdaysShort: '\u0d1e\u0d3e\u0d2f\u0d7c_\u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d7e_\u0d1a\u0d4a\u0d35\u0d4d\u0d35_\u0d2c\u0d41\u0d27\u0d7b_\u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d02_\u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f_\u0d36\u0d28\u0d3f'.split('_'),
            weekdaysMin: '\u0d1e\u0d3e_\u0d24\u0d3f_\u0d1a\u0d4a_\u0d2c\u0d41_\u0d35\u0d4d\u0d2f\u0d3e_\u0d35\u0d46_\u0d36'.split('_'),
            longDateFormat: {
                LT: 'A h:mm -\u0d28\u0d41',
                LTS: 'A h:mm:ss -\u0d28\u0d41',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A h:mm -\u0d28\u0d41',
                LLLL: 'dddd, D MMMM YYYY, A h:mm -\u0d28\u0d41'
            },
            calendar: {
                sameDay: '[\u0d07\u0d28\u0d4d\u0d28\u0d4d] LT',
                nextDay: '[\u0d28\u0d3e\u0d33\u0d46] LT',
                nextWeek: 'dddd, LT',
                lastDay: '[\u0d07\u0d28\u0d4d\u0d28\u0d32\u0d46] LT',
                lastWeek: '[\u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e] dddd, LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e\u0d4d',
                past: '%s \u0d2e\u0d41\u0d7b\u0d2a\u0d4d',
                s: '\u0d05\u0d7d\u0d2a \u0d28\u0d3f\u0d2e\u0d3f\u0d37\u0d19\u0d4d\u0d19\u0d7e',
                m: '\u0d12\u0d30\u0d41 \u0d2e\u0d3f\u0d28\u0d3f\u0d31\u0d4d\u0d31\u0d4d',
                mm: '%d \u0d2e\u0d3f\u0d28\u0d3f\u0d31\u0d4d\u0d31\u0d4d',
                h: '\u0d12\u0d30\u0d41 \u0d2e\u0d23\u0d3f\u0d15\u0d4d\u0d15\u0d42\u0d7c',
                hh: '%d \u0d2e\u0d23\u0d3f\u0d15\u0d4d\u0d15\u0d42\u0d7c',
                d: '\u0d12\u0d30\u0d41 \u0d26\u0d3f\u0d35\u0d38\u0d02',
                dd: '%d \u0d26\u0d3f\u0d35\u0d38\u0d02',
                M: '\u0d12\u0d30\u0d41 \u0d2e\u0d3e\u0d38\u0d02',
                MM: '%d \u0d2e\u0d3e\u0d38\u0d02',
                y: '\u0d12\u0d30\u0d41 \u0d35\u0d7c\u0d37\u0d02',
                yy: '%d \u0d35\u0d7c\u0d37\u0d02'
            },
            meridiemParse: /രാത്രി|രാവിലെ|ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി/i,
            isPM: function (input) {
                return /^(ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u0d30\u0d3e\u0d24\u0d4d\u0d30\u0d3f';
                } else if (hour < 12) {
                    return '\u0d30\u0d3e\u0d35\u0d3f\u0d32\u0d46';
                } else if (hour < 17) {
                    return '\u0d09\u0d1a\u0d4d\u0d1a \u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e\u0d4d';
                } else if (hour < 20) {
                    return '\u0d35\u0d48\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d47\u0d30\u0d02';
                } else {
                    return '\u0d30\u0d3e\u0d24\u0d4d\u0d30\u0d3f';
                }
            }
        });
    //! moment.js locale configuration
    //! locale : Marathi (mr)
    //! author : Harshad Kale : https://github.com/kalehv
    var mr__symbolMap = {
            '1': '\u0967',
            '2': '\u0968',
            '3': '\u0969',
            '4': '\u096a',
            '5': '\u096b',
            '6': '\u096c',
            '7': '\u096d',
            '8': '\u096e',
            '9': '\u096f',
            '0': '\u0966'
        }, mr__numberMap = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096a': '4',
            '\u096b': '5',
            '\u096c': '6',
            '\u096d': '7',
            '\u096e': '8',
            '\u096f': '9',
            '\u0966': '0'
        };
    var mr = _moment__default.defineLocale('mr', {
            months: '\u091c\u093e\u0928\u0947\u0935\u093e\u0930\u0940_\u092b\u0947\u092c\u094d\u0930\u0941\u0935\u093e\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u090f\u092a\u094d\u0930\u093f\u0932_\u092e\u0947_\u091c\u0942\u0928_\u091c\u0941\u0932\u0948_\u0911\u0917\u0938\u094d\u091f_\u0938\u092a\u094d\u091f\u0947\u0902\u092c\u0930_\u0911\u0915\u094d\u091f\u094b\u092c\u0930_\u0928\u094b\u0935\u094d\u0939\u0947\u0902\u092c\u0930_\u0921\u093f\u0938\u0947\u0902\u092c\u0930'.split('_'),
            monthsShort: '\u091c\u093e\u0928\u0947._\u092b\u0947\u092c\u094d\u0930\u0941._\u092e\u093e\u0930\u094d\u091a._\u090f\u092a\u094d\u0930\u093f._\u092e\u0947._\u091c\u0942\u0928._\u091c\u0941\u0932\u0948._\u0911\u0917._\u0938\u092a\u094d\u091f\u0947\u0902._\u0911\u0915\u094d\u091f\u094b._\u0928\u094b\u0935\u094d\u0939\u0947\u0902._\u0921\u093f\u0938\u0947\u0902.'.split('_'),
            weekdays: '\u0930\u0935\u093f\u0935\u093e\u0930_\u0938\u094b\u092e\u0935\u093e\u0930_\u092e\u0902\u0917\u0933\u0935\u093e\u0930_\u092c\u0941\u0927\u0935\u093e\u0930_\u0917\u0941\u0930\u0942\u0935\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u0935\u093e\u0930_\u0936\u0928\u093f\u0935\u093e\u0930'.split('_'),
            weekdaysShort: '\u0930\u0935\u093f_\u0938\u094b\u092e_\u092e\u0902\u0917\u0933_\u092c\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094d\u0930_\u0936\u0928\u093f'.split('_'),
            weekdaysMin: '\u0930_\u0938\u094b_\u092e\u0902_\u092c\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split('_'),
            longDateFormat: {
                LT: 'A h:mm \u0935\u093e\u091c\u0924\u093e',
                LTS: 'A h:mm:ss \u0935\u093e\u091c\u0924\u093e',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A h:mm \u0935\u093e\u091c\u0924\u093e',
                LLLL: 'dddd, D MMMM YYYY, A h:mm \u0935\u093e\u091c\u0924\u093e'
            },
            calendar: {
                sameDay: '[\u0906\u091c] LT',
                nextDay: '[\u0909\u0926\u094d\u092f\u093e] LT',
                nextWeek: 'dddd, LT',
                lastDay: '[\u0915\u093e\u0932] LT',
                lastWeek: '[\u092e\u093e\u0917\u0940\u0932] dddd, LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \u0928\u0902\u0924\u0930',
                past: '%s \u092a\u0942\u0930\u094d\u0935\u0940',
                s: '\u0938\u0947\u0915\u0902\u0926',
                m: '\u090f\u0915 \u092e\u093f\u0928\u093f\u091f',
                mm: '%d \u092e\u093f\u0928\u093f\u091f\u0947',
                h: '\u090f\u0915 \u0924\u093e\u0938',
                hh: '%d \u0924\u093e\u0938',
                d: '\u090f\u0915 \u0926\u093f\u0935\u0938',
                dd: '%d \u0926\u093f\u0935\u0938',
                M: '\u090f\u0915 \u092e\u0939\u093f\u0928\u093e',
                MM: '%d \u092e\u0939\u093f\u0928\u0947',
                y: '\u090f\u0915 \u0935\u0930\u094d\u0937',
                yy: '%d \u0935\u0930\u094d\u0937\u0947'
            },
            preparse: function (string) {
                return string.replace(/[१२३४५६७८९०]/g, function (match) {
                    return mr__numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return mr__symbolMap[match];
                });
            },
            meridiemParse: /रात्री|सकाळी|दुपारी|सायंकाळी/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === '\u0930\u093e\u0924\u094d\u0930\u0940') {
                    return hour < 4 ? hour : hour + 12;
                } else if (meridiem === '\u0938\u0915\u093e\u0933\u0940') {
                    return hour;
                } else if (meridiem === '\u0926\u0941\u092a\u093e\u0930\u0940') {
                    return hour >= 10 ? hour : hour + 12;
                } else if (meridiem === '\u0938\u093e\u092f\u0902\u0915\u093e\u0933\u0940') {
                    return hour + 12;
                }
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u0930\u093e\u0924\u094d\u0930\u0940';
                } else if (hour < 10) {
                    return '\u0938\u0915\u093e\u0933\u0940';
                } else if (hour < 17) {
                    return '\u0926\u0941\u092a\u093e\u0930\u0940';
                } else if (hour < 20) {
                    return '\u0938\u093e\u092f\u0902\u0915\u093e\u0933\u0940';
                } else {
                    return '\u0930\u093e\u0924\u094d\u0930\u0940';
                }
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    //! moment.js locale configuration
    //! locale : Bahasa Malaysia (ms-MY)
    //! author : Weldan Jamili : https://github.com/weldan
    var ms_my = _moment__default.defineLocale('ms-my', {
            months: 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
            monthsShort: 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
            weekdays: 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
            weekdaysShort: 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
            weekdaysMin: 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm'
            },
            meridiemParse: /pagi|tengahari|petang|malam/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'pagi') {
                    return hour;
                } else if (meridiem === 'tengahari') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === 'petang' || meridiem === 'malam') {
                    return hour + 12;
                }
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours < 11) {
                    return 'pagi';
                } else if (hours < 15) {
                    return 'tengahari';
                } else if (hours < 19) {
                    return 'petang';
                } else {
                    return 'malam';
                }
            },
            calendar: {
                sameDay: '[Hari ini pukul] LT',
                nextDay: '[Esok pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kelmarin pukul] LT',
                lastWeek: 'dddd [lepas pukul] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'dalam %s',
                past: '%s yang lepas',
                s: 'beberapa saat',
                m: 'seminit',
                mm: '%d minit',
                h: 'sejam',
                hh: '%d jam',
                d: 'sehari',
                dd: '%d hari',
                M: 'sebulan',
                MM: '%d bulan',
                y: 'setahun',
                yy: '%d tahun'
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Bahasa Malaysia (ms-MY)
    //! author : Weldan Jamili : https://github.com/weldan
    var locale_ms = _moment__default.defineLocale('ms', {
            months: 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
            monthsShort: 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
            weekdays: 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
            weekdaysShort: 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
            weekdaysMin: 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm'
            },
            meridiemParse: /pagi|tengahari|petang|malam/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'pagi') {
                    return hour;
                } else if (meridiem === 'tengahari') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === 'petang' || meridiem === 'malam') {
                    return hour + 12;
                }
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours < 11) {
                    return 'pagi';
                } else if (hours < 15) {
                    return 'tengahari';
                } else if (hours < 19) {
                    return 'petang';
                } else {
                    return 'malam';
                }
            },
            calendar: {
                sameDay: '[Hari ini pukul] LT',
                nextDay: '[Esok pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kelmarin pukul] LT',
                lastWeek: 'dddd [lepas pukul] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'dalam %s',
                past: '%s yang lepas',
                s: 'beberapa saat',
                m: 'seminit',
                mm: '%d minit',
                h: 'sejam',
                hh: '%d jam',
                d: 'sehari',
                dd: '%d hari',
                M: 'sebulan',
                MM: '%d bulan',
                y: 'setahun',
                yy: '%d tahun'
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Burmese (my)
    //! author : Squar team, mysquar.com
    var my__symbolMap = {
            '1': '\u1041',
            '2': '\u1042',
            '3': '\u1043',
            '4': '\u1044',
            '5': '\u1045',
            '6': '\u1046',
            '7': '\u1047',
            '8': '\u1048',
            '9': '\u1049',
            '0': '\u1040'
        }, my__numberMap = {
            '\u1041': '1',
            '\u1042': '2',
            '\u1043': '3',
            '\u1044': '4',
            '\u1045': '5',
            '\u1046': '6',
            '\u1047': '7',
            '\u1048': '8',
            '\u1049': '9',
            '\u1040': '0'
        };
    var my = _moment__default.defineLocale('my', {
            months: '\u1007\u1014\u103a\u1014\u101d\u102b\u101b\u102e_\u1016\u1031\u1016\u1031\u102c\u103a\u101d\u102b\u101b\u102e_\u1019\u1010\u103a_\u1027\u1015\u103c\u102e_\u1019\u1031_\u1007\u103d\u1014\u103a_\u1007\u1030\u101c\u102d\u102f\u1004\u103a_\u101e\u103c\u1002\u102f\u1010\u103a_\u1005\u1000\u103a\u1010\u1004\u103a\u1018\u102c_\u1021\u1031\u102c\u1000\u103a\u1010\u102d\u102f\u1018\u102c_\u1014\u102d\u102f\u101d\u1004\u103a\u1018\u102c_\u1012\u102e\u1007\u1004\u103a\u1018\u102c'.split('_'),
            monthsShort: '\u1007\u1014\u103a_\u1016\u1031_\u1019\u1010\u103a_\u1015\u103c\u102e_\u1019\u1031_\u1007\u103d\u1014\u103a_\u101c\u102d\u102f\u1004\u103a_\u101e\u103c_\u1005\u1000\u103a_\u1021\u1031\u102c\u1000\u103a_\u1014\u102d\u102f_\u1012\u102e'.split('_'),
            weekdays: '\u1010\u1014\u1004\u103a\u1039\u1002\u1014\u103d\u1031_\u1010\u1014\u1004\u103a\u1039\u101c\u102c_\u1021\u1004\u103a\u1039\u1002\u102b_\u1017\u102f\u1012\u1039\u1013\u101f\u1030\u1038_\u1000\u103c\u102c\u101e\u1015\u1010\u1031\u1038_\u101e\u1031\u102c\u1000\u103c\u102c_\u1005\u1014\u1031'.split('_'),
            weekdaysShort: '\u1014\u103d\u1031_\u101c\u102c_\u1002\u102b_\u101f\u1030\u1038_\u1000\u103c\u102c_\u101e\u1031\u102c_\u1014\u1031'.split('_'),
            weekdaysMin: '\u1014\u103d\u1031_\u101c\u102c_\u1002\u102b_\u101f\u1030\u1038_\u1000\u103c\u102c_\u101e\u1031\u102c_\u1014\u1031'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[\u101a\u1014\u1031.] LT [\u1019\u103e\u102c]',
                nextDay: '[\u1019\u1014\u1000\u103a\u1016\u103c\u1014\u103a] LT [\u1019\u103e\u102c]',
                nextWeek: 'dddd LT [\u1019\u103e\u102c]',
                lastDay: '[\u1019\u1014\u1031.\u1000] LT [\u1019\u103e\u102c]',
                lastWeek: '[\u1015\u103c\u102e\u1038\u1001\u1032\u1037\u101e\u1031\u102c] dddd LT [\u1019\u103e\u102c]',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u101c\u102c\u1019\u100a\u103a\u1037 %s \u1019\u103e\u102c',
                past: '\u101c\u103d\u1014\u103a\u1001\u1032\u1037\u101e\u1031\u102c %s \u1000',
                s: '\u1005\u1000\u1039\u1000\u1014\u103a.\u1021\u1014\u100a\u103a\u1038\u1004\u101a\u103a',
                m: '\u1010\u1005\u103a\u1019\u102d\u1014\u1005\u103a',
                mm: '%d \u1019\u102d\u1014\u1005\u103a',
                h: '\u1010\u1005\u103a\u1014\u102c\u101b\u102e',
                hh: '%d \u1014\u102c\u101b\u102e',
                d: '\u1010\u1005\u103a\u101b\u1000\u103a',
                dd: '%d \u101b\u1000\u103a',
                M: '\u1010\u1005\u103a\u101c',
                MM: '%d \u101c',
                y: '\u1010\u1005\u103a\u1014\u103e\u1005\u103a',
                yy: '%d \u1014\u103e\u1005\u103a'
            },
            preparse: function (string) {
                return string.replace(/[၁၂၃၄၅၆၇၈၉၀]/g, function (match) {
                    return my__numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return my__symbolMap[match];
                });
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : norwegian bokmål (nb)
    //! authors : Espen Hovlandsdal : https://github.com/rexxars
    //!           Sigurd Gartmann : https://github.com/sigurdga
    var nb = _moment__default.defineLocale('nb', {
            months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
            monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays: 's\xf8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xf8rdag'.split('_'),
            weekdaysShort: 's\xf8n_man_tirs_ons_tors_fre_l\xf8r'.split('_'),
            weekdaysMin: 's\xf8_ma_ti_on_to_fr_l\xf8'.split('_'),
            longDateFormat: {
                LT: 'H.mm',
                LTS: 'H.mm.ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY [kl.] H.mm',
                LLLL: 'dddd D. MMMM YYYY [kl.] H.mm'
            },
            calendar: {
                sameDay: '[i dag kl.] LT',
                nextDay: '[i morgen kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[i g\xe5r kl.] LT',
                lastWeek: '[forrige] dddd [kl.] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'om %s',
                past: 'for %s siden',
                s: 'noen sekunder',
                m: 'ett minutt',
                mm: '%d minutter',
                h: 'en time',
                hh: '%d timer',
                d: 'en dag',
                dd: '%d dager',
                M: 'en m\xe5ned',
                MM: '%d m\xe5neder',
                y: 'ett \xe5r',
                yy: '%d \xe5r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : nepali/nepalese
    //! author : suvash : https://github.com/suvash
    var ne__symbolMap = {
            '1': '\u0967',
            '2': '\u0968',
            '3': '\u0969',
            '4': '\u096a',
            '5': '\u096b',
            '6': '\u096c',
            '7': '\u096d',
            '8': '\u096e',
            '9': '\u096f',
            '0': '\u0966'
        }, ne__numberMap = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096a': '4',
            '\u096b': '5',
            '\u096c': '6',
            '\u096d': '7',
            '\u096e': '8',
            '\u096f': '9',
            '\u0966': '0'
        };
    var ne = _moment__default.defineLocale('ne', {
            months: '\u091c\u0928\u0935\u0930\u0940_\u092b\u0947\u092c\u094d\u0930\u0941\u0935\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u093f\u0932_\u092e\u0908_\u091c\u0941\u0928_\u091c\u0941\u0932\u093e\u0908_\u0905\u0917\u0937\u094d\u091f_\u0938\u0947\u092a\u094d\u091f\u0947\u092e\u094d\u092c\u0930_\u0905\u0915\u094d\u091f\u094b\u092c\u0930_\u0928\u094b\u092d\u0947\u092e\u094d\u092c\u0930_\u0921\u093f\u0938\u0947\u092e\u094d\u092c\u0930'.split('_'),
            monthsShort: '\u091c\u0928._\u092b\u0947\u092c\u094d\u0930\u0941._\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u093f._\u092e\u0908_\u091c\u0941\u0928_\u091c\u0941\u0932\u093e\u0908._\u0905\u0917._\u0938\u0947\u092a\u094d\u091f._\u0905\u0915\u094d\u091f\u094b._\u0928\u094b\u092d\u0947._\u0921\u093f\u0938\u0947.'.split('_'),
            weekdays: '\u0906\u0907\u0924\u092c\u093e\u0930_\u0938\u094b\u092e\u092c\u093e\u0930_\u092e\u0919\u094d\u0917\u0932\u092c\u093e\u0930_\u092c\u0941\u0927\u092c\u093e\u0930_\u092c\u093f\u0939\u093f\u092c\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u092c\u093e\u0930_\u0936\u0928\u093f\u092c\u093e\u0930'.split('_'),
            weekdaysShort: '\u0906\u0907\u0924._\u0938\u094b\u092e._\u092e\u0919\u094d\u0917\u0932._\u092c\u0941\u0927._\u092c\u093f\u0939\u093f._\u0936\u0941\u0915\u094d\u0930._\u0936\u0928\u093f.'.split('_'),
            weekdaysMin: '\u0906\u0907._\u0938\u094b._\u092e\u0919\u094d_\u092c\u0941._\u092c\u093f._\u0936\u0941._\u0936.'.split('_'),
            longDateFormat: {
                LT: 'A\u0915\u094b h:mm \u092c\u091c\u0947',
                LTS: 'A\u0915\u094b h:mm:ss \u092c\u091c\u0947',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A\u0915\u094b h:mm \u092c\u091c\u0947',
                LLLL: 'dddd, D MMMM YYYY, A\u0915\u094b h:mm \u092c\u091c\u0947'
            },
            preparse: function (string) {
                return string.replace(/[१२३४५६७८९०]/g, function (match) {
                    return ne__numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return ne__symbolMap[match];
                });
            },
            meridiemParse: /राती|बिहान|दिउँसो|बेलुका|साँझ|राती/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === '\u0930\u093e\u0924\u0940') {
                    return hour < 3 ? hour : hour + 12;
                } else if (meridiem === '\u092c\u093f\u0939\u093e\u0928') {
                    return hour;
                } else if (meridiem === '\u0926\u093f\u0909\u0901\u0938\u094b') {
                    return hour >= 10 ? hour : hour + 12;
                } else if (meridiem === '\u092c\u0947\u0932\u0941\u0915\u093e' || meridiem === '\u0938\u093e\u0901\u091d') {
                    return hour + 12;
                }
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 3) {
                    return '\u0930\u093e\u0924\u0940';
                } else if (hour < 10) {
                    return '\u092c\u093f\u0939\u093e\u0928';
                } else if (hour < 15) {
                    return '\u0926\u093f\u0909\u0901\u0938\u094b';
                } else if (hour < 18) {
                    return '\u092c\u0947\u0932\u0941\u0915\u093e';
                } else if (hour < 20) {
                    return '\u0938\u093e\u0901\u091d';
                } else {
                    return '\u0930\u093e\u0924\u0940';
                }
            },
            calendar: {
                sameDay: '[\u0906\u091c] LT',
                nextDay: '[\u092d\u094b\u0932\u0940] LT',
                nextWeek: '[\u0906\u0909\u0901\u0926\u094b] dddd[,] LT',
                lastDay: '[\u0939\u093f\u091c\u094b] LT',
                lastWeek: '[\u0917\u090f\u0915\u094b] dddd[,] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s\u092e\u093e',
                past: '%s \u0905\u0917\u093e\u0921\u0940',
                s: '\u0915\u0947\u0939\u0940 \u0938\u092e\u092f',
                m: '\u090f\u0915 \u092e\u093f\u0928\u0947\u091f',
                mm: '%d \u092e\u093f\u0928\u0947\u091f',
                h: '\u090f\u0915 \u0918\u0923\u094d\u091f\u093e',
                hh: '%d \u0918\u0923\u094d\u091f\u093e',
                d: '\u090f\u0915 \u0926\u093f\u0928',
                dd: '%d \u0926\u093f\u0928',
                M: '\u090f\u0915 \u092e\u0939\u093f\u0928\u093e',
                MM: '%d \u092e\u0939\u093f\u0928\u093e',
                y: '\u090f\u0915 \u092c\u0930\u094d\u0937',
                yy: '%d \u092c\u0930\u094d\u0937'
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : dutch (nl)
    //! author : Joris Röling : https://github.com/jjupiter
    var nl__monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'), nl__monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');
    var nl = _moment__default.defineLocale('nl', {
            months: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
            monthsShort: function (m, format) {
                if (/-MMM-/.test(format)) {
                    return nl__monthsShortWithoutDots[m.month()];
                } else {
                    return nl__monthsShortWithDots[m.month()];
                }
            },
            weekdays: 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
            weekdaysShort: 'zo._ma._di._wo._do._vr._za.'.split('_'),
            weekdaysMin: 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD-MM-YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[vandaag om] LT',
                nextDay: '[morgen om] LT',
                nextWeek: 'dddd [om] LT',
                lastDay: '[gisteren om] LT',
                lastWeek: '[afgelopen] dddd [om] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'over %s',
                past: '%s geleden',
                s: 'een paar seconden',
                m: '\xe9\xe9n minuut',
                mm: '%d minuten',
                h: '\xe9\xe9n uur',
                hh: '%d uur',
                d: '\xe9\xe9n dag',
                dd: '%d dagen',
                M: '\xe9\xe9n maand',
                MM: '%d maanden',
                y: '\xe9\xe9n jaar',
                yy: '%d jaar'
            },
            ordinalParse: /\d{1,2}(ste|de)/,
            ordinal: function (number) {
                return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : norwegian nynorsk (nn)
    //! author : https://github.com/mechuwind
    var nn = _moment__default.defineLocale('nn', {
            months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
            monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays: 'sundag_m\xe5ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
            weekdaysShort: 'sun_m\xe5n_tys_ons_tor_fre_lau'.split('_'),
            weekdaysMin: 'su_m\xe5_ty_on_to_fr_l\xf8'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[I dag klokka] LT',
                nextDay: '[I morgon klokka] LT',
                nextWeek: 'dddd [klokka] LT',
                lastDay: '[I g\xe5r klokka] LT',
                lastWeek: '[F\xf8reg\xe5ande] dddd [klokka] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'om %s',
                past: 'for %s sidan',
                s: 'nokre sekund',
                m: 'eit minutt',
                mm: '%d minutt',
                h: 'ein time',
                hh: '%d timar',
                d: 'ein dag',
                dd: '%d dagar',
                M: 'ein m\xe5nad',
                MM: '%d m\xe5nader',
                y: 'eit \xe5r',
                yy: '%d \xe5r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : polish (pl)
    //! author : Rafal Hirsz : https://github.com/evoL
    var monthsNominative = 'stycze\u0144_luty_marzec_kwiecie\u0144_maj_czerwiec_lipiec_sierpie\u0144_wrzesie\u0144_pa\u017adziernik_listopad_grudzie\u0144'.split('_'), monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrze\u015bnia_pa\u017adziernika_listopada_grudnia'.split('_');
    function pl__plural(n) {
        return n % 10 < 5 && n % 10 > 1 && ~~(n / 10) % 10 !== 1;
    }
    function pl__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'minuta' : 'minut\u0119';
        case 'mm':
            return result + (pl__plural(number) ? 'minuty' : 'minut');
        case 'h':
            return withoutSuffix ? 'godzina' : 'godzin\u0119';
        case 'hh':
            return result + (pl__plural(number) ? 'godziny' : 'godzin');
        case 'MM':
            return result + (pl__plural(number) ? 'miesi\u0105ce' : 'miesi\u0119cy');
        case 'yy':
            return result + (pl__plural(number) ? 'lata' : 'lat');
        }
    }
    var pl = _moment__default.defineLocale('pl', {
            months: function (momentToFormat, format) {
                if (format === '') {
                    // Hack: if format empty we know this is used to generate
                    // RegExp by moment. Give then back both valid forms of months
                    // in RegExp ready format.
                    return '(' + monthsSubjective[momentToFormat.month()] + '|' + monthsNominative[momentToFormat.month()] + ')';
                } else if (/D MMMM/.test(format)) {
                    return monthsSubjective[momentToFormat.month()];
                } else {
                    return monthsNominative[momentToFormat.month()];
                }
            },
            monthsShort: 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa\u017a_lis_gru'.split('_'),
            weekdays: 'niedziela_poniedzia\u0142ek_wtorek_\u015broda_czwartek_pi\u0105tek_sobota'.split('_'),
            weekdaysShort: 'nie_pon_wt_\u015br_czw_pt_sb'.split('_'),
            weekdaysMin: 'N_Pn_Wt_\u015ar_Cz_Pt_So'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Dzi\u015b o] LT',
                nextDay: '[Jutro o] LT',
                nextWeek: '[W] dddd [o] LT',
                lastDay: '[Wczoraj o] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[W zesz\u0142\u0105 niedziel\u0119 o] LT';
                    case 3:
                        return '[W zesz\u0142\u0105 \u015brod\u0119 o] LT';
                    case 6:
                        return '[W zesz\u0142\u0105 sobot\u0119 o] LT';
                    default:
                        return '[W zesz\u0142y] dddd [o] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: '%s temu',
                s: 'kilka sekund',
                m: pl__translate,
                mm: pl__translate,
                h: pl__translate,
                hh: pl__translate,
                d: '1 dzie\u0144',
                dd: '%d dni',
                M: 'miesi\u0105c',
                MM: pl__translate,
                y: 'rok',
                yy: pl__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : brazilian portuguese (pt-br)
    //! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira
    var pt_br = _moment__default.defineLocale('pt-br', {
            months: 'Janeiro_Fevereiro_Mar\xe7o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
            monthsShort: 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
            weekdays: 'Domingo_Segunda-Feira_Ter\xe7a-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_S\xe1bado'.split('_'),
            weekdaysShort: 'Dom_Seg_Ter_Qua_Qui_Sex_S\xe1b'.split('_'),
            weekdaysMin: 'Dom_2\xaa_3\xaa_4\xaa_5\xaa_6\xaa_S\xe1b'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [de] MMMM [de] YYYY',
                LLL: 'D [de] MMMM [de] YYYY [\xe0s] HH:mm',
                LLLL: 'dddd, D [de] MMMM [de] YYYY [\xe0s] HH:mm'
            },
            calendar: {
                sameDay: '[Hoje \xe0s] LT',
                nextDay: '[Amanh\xe3 \xe0s] LT',
                nextWeek: 'dddd [\xe0s] LT',
                lastDay: '[Ontem \xe0s] LT',
                lastWeek: function () {
                    return this.day() === 0 || this.day() === 6 ? '[\xdaltimo] dddd [\xe0s] LT' : '[\xdaltima] dddd [\xe0s] LT';    // Monday - Friday
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'em %s',
                past: '%s atr\xe1s',
                s: 'poucos segundos',
                m: 'um minuto',
                mm: '%d minutos',
                h: 'uma hora',
                hh: '%d horas',
                d: 'um dia',
                dd: '%d dias',
                M: 'um m\xeas',
                MM: '%d meses',
                y: 'um ano',
                yy: '%d anos'
            },
            ordinalParse: /\d{1,2}º/,
            ordinal: '%d\xba'
        });
    //! moment.js locale configuration
    //! locale : portuguese (pt)
    //! author : Jefferson : https://github.com/jalex79
    var pt = _moment__default.defineLocale('pt', {
            months: 'Janeiro_Fevereiro_Mar\xe7o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
            monthsShort: 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
            weekdays: 'Domingo_Segunda-Feira_Ter\xe7a-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_S\xe1bado'.split('_'),
            weekdaysShort: 'Dom_Seg_Ter_Qua_Qui_Sex_S\xe1b'.split('_'),
            weekdaysMin: 'Dom_2\xaa_3\xaa_4\xaa_5\xaa_6\xaa_S\xe1b'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [de] MMMM [de] YYYY',
                LLL: 'D [de] MMMM [de] YYYY HH:mm',
                LLLL: 'dddd, D [de] MMMM [de] YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Hoje \xe0s] LT',
                nextDay: '[Amanh\xe3 \xe0s] LT',
                nextWeek: 'dddd [\xe0s] LT',
                lastDay: '[Ontem \xe0s] LT',
                lastWeek: function () {
                    return this.day() === 0 || this.day() === 6 ? '[\xdaltimo] dddd [\xe0s] LT' : '[\xdaltima] dddd [\xe0s] LT';    // Monday - Friday
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'em %s',
                past: 'h\xe1 %s',
                s: 'segundos',
                m: 'um minuto',
                mm: '%d minutos',
                h: 'uma hora',
                hh: '%d horas',
                d: 'um dia',
                dd: '%d dias',
                M: 'um m\xeas',
                MM: '%d meses',
                y: 'um ano',
                yy: '%d anos'
            },
            ordinalParse: /\d{1,2}º/,
            ordinal: '%d\xba',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : romanian (ro)
    //! author : Vlad Gurdiga : https://github.com/gurdiga
    //! author : Valentin Agachi : https://github.com/avaly
    function ro__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': 'minute',
                'hh': 'ore',
                'dd': 'zile',
                'MM': 'luni',
                'yy': 'ani'
            }, separator = ' ';
        if (number % 100 >= 20 || number >= 100 && number % 100 === 0) {
            separator = ' de ';
        }
        return number + separator + format[key];
    }
    var ro = _moment__default.defineLocale('ro', {
            months: 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
            monthsShort: 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
            weekdays: 'duminic\u0103_luni_mar\u021bi_miercuri_joi_vineri_s\xe2mb\u0103t\u0103'.split('_'),
            weekdaysShort: 'Dum_Lun_Mar_Mie_Joi_Vin_S\xe2m'.split('_'),
            weekdaysMin: 'Du_Lu_Ma_Mi_Jo_Vi_S\xe2'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd, D MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[azi la] LT',
                nextDay: '[m\xe2ine la] LT',
                nextWeek: 'dddd [la] LT',
                lastDay: '[ieri la] LT',
                lastWeek: '[fosta] dddd [la] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'peste %s',
                past: '%s \xeen urm\u0103',
                s: 'c\xe2teva secunde',
                m: 'un minut',
                mm: ro__relativeTimeWithPlural,
                h: 'o or\u0103',
                hh: ro__relativeTimeWithPlural,
                d: 'o zi',
                dd: ro__relativeTimeWithPlural,
                M: 'o lun\u0103',
                MM: ro__relativeTimeWithPlural,
                y: 'un an',
                yy: ro__relativeTimeWithPlural
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : russian (ru)
    //! author : Viktorminator : https://github.com/Viktorminator
    //! Author : Menelion Elensúle : https://github.com/Oire
    function ru__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
    }
    function ru__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': withoutSuffix ? '\u043c\u0438\u043d\u0443\u0442\u0430_\u043c\u0438\u043d\u0443\u0442\u044b_\u043c\u0438\u043d\u0443\u0442' : '\u043c\u0438\u043d\u0443\u0442\u0443_\u043c\u0438\u043d\u0443\u0442\u044b_\u043c\u0438\u043d\u0443\u0442',
                'hh': '\u0447\u0430\u0441_\u0447\u0430\u0441\u0430_\u0447\u0430\u0441\u043e\u0432',
                'dd': '\u0434\u0435\u043d\u044c_\u0434\u043d\u044f_\u0434\u043d\u0435\u0439',
                'MM': '\u043c\u0435\u0441\u044f\u0446_\u043c\u0435\u0441\u044f\u0446\u0430_\u043c\u0435\u0441\u044f\u0446\u0435\u0432',
                'yy': '\u0433\u043e\u0434_\u0433\u043e\u0434\u0430_\u043b\u0435\u0442'
            };
        if (key === 'm') {
            return withoutSuffix ? '\u043c\u0438\u043d\u0443\u0442\u0430' : '\u043c\u0438\u043d\u0443\u0442\u0443';
        } else {
            return number + ' ' + ru__plural(format[key], +number);
        }
    }
    function ru__monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u044f\u043d\u0432\u0430\u0440\u044c_\u0444\u0435\u0432\u0440\u0430\u043b\u044c_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0435\u043b\u044c_\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c_\u043e\u043a\u0442\u044f\u0431\u0440\u044c_\u043d\u043e\u044f\u0431\u0440\u044c_\u0434\u0435\u043a\u0430\u0431\u0440\u044c'.split('_'),
                'accusative': '\u044f\u043d\u0432\u0430\u0440\u044f_\u0444\u0435\u0432\u0440\u0430\u043b\u044f_\u043c\u0430\u0440\u0442\u0430_\u0430\u043f\u0440\u0435\u043b\u044f_\u043c\u0430\u044f_\u0438\u044e\u043d\u044f_\u0438\u044e\u043b\u044f_\u0430\u0432\u0433\u0443\u0441\u0442\u0430_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044f_\u043e\u043a\u0442\u044f\u0431\u0440\u044f_\u043d\u043e\u044f\u0431\u0440\u044f_\u0434\u0435\u043a\u0430\u0431\u0440\u044f'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function ru__monthsShortCaseReplace(m, format) {
        var monthsShort = {
                'nominative': '\u044f\u043d\u0432_\u0444\u0435\u0432_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440_\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433_\u0441\u0435\u043d_\u043e\u043a\u0442_\u043d\u043e\u044f_\u0434\u0435\u043a'.split('_'),
                'accusative': '\u044f\u043d\u0432_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u044f_\u0438\u044e\u043d\u044f_\u0438\u044e\u043b\u044f_\u0430\u0432\u0433_\u0441\u0435\u043d_\u043e\u043a\u0442_\u043d\u043e\u044f_\u0434\u0435\u043a'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return monthsShort[nounCase][m.month()];
    }
    function ru__weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043f\u044f\u0442\u043d\u0438\u0446\u0430_\u0441\u0443\u0431\u0431\u043e\u0442\u0430'.split('_'),
                'accusative': '\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043f\u044f\u0442\u043d\u0438\u0446\u0443_\u0441\u0443\u0431\u0431\u043e\u0442\u0443'.split('_')
            }, nounCase = /\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    var ru = _moment__default.defineLocale('ru', {
            months: ru__monthsCaseReplace,
            monthsShort: ru__monthsShortCaseReplace,
            weekdays: ru__weekdaysCaseReplace,
            weekdaysShort: '\u0432\u0441_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
            weekdaysMin: '\u0432\u0441_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
            monthsParse: [
                /^янв/i,
                /^фев/i,
                /^мар/i,
                /^апр/i,
                /^ма[й|я]/i,
                /^июн/i,
                /^июл/i,
                /^авг/i,
                /^сен/i,
                /^окт/i,
                /^ноя/i,
                /^дек/i
            ],
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY \u0433.',
                LLL: 'D MMMM YYYY \u0433., HH:mm',
                LLLL: 'dddd, D MMMM YYYY \u0433., HH:mm'
            },
            calendar: {
                sameDay: '[\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0432] LT',
                nextDay: '[\u0417\u0430\u0432\u0442\u0440\u0430 \u0432] LT',
                lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
                nextWeek: function () {
                    return this.day() === 2 ? '[\u0412\u043e] dddd [\u0432] LT' : '[\u0412] dddd [\u0432] LT';
                },
                lastWeek: function (now) {
                    if (now.week() !== this.week()) {
                        switch (this.day()) {
                        case 0:
                            return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u043e\u0435] dddd [\u0432] LT';
                        case 1:
                        case 2:
                        case 4:
                            return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u044b\u0439] dddd [\u0432] LT';
                        case 3:
                        case 5:
                        case 6:
                            return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u0443\u044e] dddd [\u0432] LT';
                        }
                    } else {
                        if (this.day() === 2) {
                            return '[\u0412\u043e] dddd [\u0432] LT';
                        } else {
                            return '[\u0412] dddd [\u0432] LT';
                        }
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0447\u0435\u0440\u0435\u0437 %s',
                past: '%s \u043d\u0430\u0437\u0430\u0434',
                s: '\u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434',
                m: ru__relativeTimeWithPlural,
                mm: ru__relativeTimeWithPlural,
                h: '\u0447\u0430\u0441',
                hh: ru__relativeTimeWithPlural,
                d: '\u0434\u0435\u043d\u044c',
                dd: ru__relativeTimeWithPlural,
                M: '\u043c\u0435\u0441\u044f\u0446',
                MM: ru__relativeTimeWithPlural,
                y: '\u0433\u043e\u0434',
                yy: ru__relativeTimeWithPlural
            },
            meridiemParse: /ночи|утра|дня|вечера/i,
            isPM: function (input) {
                return /^(дня|вечера)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u043d\u043e\u0447\u0438';
                } else if (hour < 12) {
                    return '\u0443\u0442\u0440\u0430';
                } else if (hour < 17) {
                    return '\u0434\u043d\u044f';
                } else {
                    return '\u0432\u0435\u0447\u0435\u0440\u0430';
                }
            },
            ordinalParse: /\d{1,2}-(й|го|я)/,
            ordinal: function (number, period) {
                switch (period) {
                case 'M':
                case 'd':
                case 'DDD':
                    return number + '-\u0439';
                case 'D':
                    return number + '-\u0433\u043e';
                case 'w':
                case 'W':
                    return number + '-\u044f';
                default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Sinhalese (si)
    //! author : Sampath Sitinamaluwa : https://github.com/sampathsris
    var si = _moment__default.defineLocale('si', {
            months: '\u0da2\u0db1\u0dc0\u0dcf\u0dbb\u0dd2_\u0db4\u0dd9\u0db6\u0dbb\u0dc0\u0dcf\u0dbb\u0dd2_\u0db8\u0dcf\u0dbb\u0dca\u0dad\u0dd4_\u0d85\u0db4\u0dca\u200d\u0dbb\u0dda\u0dbd\u0dca_\u0db8\u0dd0\u0dba\u0dd2_\u0da2\u0dd6\u0db1\u0dd2_\u0da2\u0dd6\u0dbd\u0dd2_\u0d85\u0d9c\u0ddd\u0dc3\u0dca\u0dad\u0dd4_\u0dc3\u0dd0\u0db4\u0dca\u0dad\u0dd0\u0db8\u0dca\u0db6\u0dbb\u0dca_\u0d94\u0d9a\u0dca\u0dad\u0ddd\u0db6\u0dbb\u0dca_\u0db1\u0ddc\u0dc0\u0dd0\u0db8\u0dca\u0db6\u0dbb\u0dca_\u0daf\u0dd9\u0dc3\u0dd0\u0db8\u0dca\u0db6\u0dbb\u0dca'.split('_'),
            monthsShort: '\u0da2\u0db1_\u0db4\u0dd9\u0db6_\u0db8\u0dcf\u0dbb\u0dca_\u0d85\u0db4\u0dca_\u0db8\u0dd0\u0dba\u0dd2_\u0da2\u0dd6\u0db1\u0dd2_\u0da2\u0dd6\u0dbd\u0dd2_\u0d85\u0d9c\u0ddd_\u0dc3\u0dd0\u0db4\u0dca_\u0d94\u0d9a\u0dca_\u0db1\u0ddc\u0dc0\u0dd0_\u0daf\u0dd9\u0dc3\u0dd0'.split('_'),
            weekdays: '\u0d89\u0dbb\u0dd2\u0daf\u0dcf_\u0dc3\u0db3\u0dd4\u0daf\u0dcf_\u0d85\u0d9f\u0dc4\u0dbb\u0dd4\u0dc0\u0dcf\u0daf\u0dcf_\u0db6\u0daf\u0dcf\u0daf\u0dcf_\u0db6\u0dca\u200d\u0dbb\u0dc4\u0dc3\u0dca\u0db4\u0dad\u0dd2\u0db1\u0dca\u0daf\u0dcf_\u0dc3\u0dd2\u0d9a\u0dd4\u0dbb\u0dcf\u0daf\u0dcf_\u0dc3\u0dd9\u0db1\u0dc3\u0dd4\u0dbb\u0dcf\u0daf\u0dcf'.split('_'),
            weekdaysShort: '\u0d89\u0dbb\u0dd2_\u0dc3\u0db3\u0dd4_\u0d85\u0d9f_\u0db6\u0daf\u0dcf_\u0db6\u0dca\u200d\u0dbb\u0dc4_\u0dc3\u0dd2\u0d9a\u0dd4_\u0dc3\u0dd9\u0db1'.split('_'),
            weekdaysMin: '\u0d89_\u0dc3_\u0d85_\u0db6_\u0db6\u0dca\u200d\u0dbb_\u0dc3\u0dd2_\u0dc3\u0dd9'.split('_'),
            longDateFormat: {
                LT: 'a h:mm',
                LTS: 'a h:mm:ss',
                L: 'YYYY/MM/DD',
                LL: 'YYYY MMMM D',
                LLL: 'YYYY MMMM D, a h:mm',
                LLLL: 'YYYY MMMM D [\u0dc0\u0dd0\u0db1\u0dd2] dddd, a h:mm:ss'
            },
            calendar: {
                sameDay: '[\u0d85\u0daf] LT[\u0da7]',
                nextDay: '[\u0dc4\u0dd9\u0da7] LT[\u0da7]',
                nextWeek: 'dddd LT[\u0da7]',
                lastDay: '[\u0d8a\u0dba\u0dda] LT[\u0da7]',
                lastWeek: '[\u0db4\u0dc3\u0dd4\u0d9c\u0dd2\u0dba] dddd LT[\u0da7]',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s\u0d9a\u0dd2\u0db1\u0dca',
                past: '%s\u0d9a\u0da7 \u0db4\u0dd9\u0dbb',
                s: '\u0dad\u0dad\u0dca\u0db4\u0dbb \u0d9a\u0dd2\u0dc4\u0dd2\u0db4\u0dba',
                m: '\u0db8\u0dd2\u0db1\u0dd2\u0dad\u0dca\u0dad\u0dd4\u0dc0',
                mm: '\u0db8\u0dd2\u0db1\u0dd2\u0dad\u0dca\u0dad\u0dd4 %d',
                h: '\u0db4\u0dd0\u0dba',
                hh: '\u0db4\u0dd0\u0dba %d',
                d: '\u0daf\u0dd2\u0db1\u0dba',
                dd: '\u0daf\u0dd2\u0db1 %d',
                M: '\u0db8\u0dcf\u0dc3\u0dba',
                MM: '\u0db8\u0dcf\u0dc3 %d',
                y: '\u0dc0\u0dc3\u0dbb',
                yy: '\u0dc0\u0dc3\u0dbb %d'
            },
            ordinalParse: /\d{1,2} වැනි/,
            ordinal: function (number) {
                return number + ' \u0dc0\u0dd0\u0db1\u0dd2';
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? '\u0db4.\u0dc0.' : '\u0db4\u0dc3\u0dca \u0dc0\u0dbb\u0dd4';
                } else {
                    return isLower ? '\u0db4\u0dd9.\u0dc0.' : '\u0db4\u0dd9\u0dbb \u0dc0\u0dbb\u0dd4';
                }
            }
        });
    //! moment.js locale configuration
    //! locale : slovak (sk)
    //! author : Martin Minka : https://github.com/k2s
    //! based on work of petrbela : https://github.com/petrbela
    var sk__months = 'janu\xe1r_febru\xe1r_marec_apr\xedl_m\xe1j_j\xfan_j\xfal_august_september_okt\xf3ber_november_december'.split('_'), sk__monthsShort = 'jan_feb_mar_apr_m\xe1j_j\xfan_j\xfal_aug_sep_okt_nov_dec'.split('_');
    function sk__plural(n) {
        return n > 1 && n < 5;
    }
    function sk__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            // a few seconds / in a few seconds / a few seconds ago
            return withoutSuffix || isFuture ? 'p\xe1r sek\xfand' : 'p\xe1r sekundami';
        case 'm':
            // a minute / in a minute / a minute ago
            return withoutSuffix ? 'min\xfata' : isFuture ? 'min\xfatu' : 'min\xfatou';
        case 'mm':
            // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'min\xfaty' : 'min\xfat');
            } else {
                return result + 'min\xfatami';
            }
            break;
        case 'h':
            // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
            // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'hodiny' : 'hod\xedn');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':
            // a day / in a day / a day ago
            return withoutSuffix || isFuture ? 'de\u0148' : 'd\u0148om';
        case 'dd':
            // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'dni' : 'dn\xed');
            } else {
                return result + 'd\u0148ami';
            }
            break;
        case 'M':
            // a month / in a month / a month ago
            return withoutSuffix || isFuture ? 'mesiac' : 'mesiacom';
        case 'MM':
            // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'mesiace' : 'mesiacov');
            } else {
                return result + 'mesiacmi';
            }
            break;
        case 'y':
            // a year / in a year / a year ago
            return withoutSuffix || isFuture ? 'rok' : 'rokom';
        case 'yy':
            // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'roky' : 'rokov');
            } else {
                return result + 'rokmi';
            }
            break;
        }
    }
    var sk = _moment__default.defineLocale('sk', {
            months: sk__months,
            monthsShort: sk__monthsShort,
            monthsParse: function (months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; i < 12; i++) {
                    // use custom parser to solve problem with July (červenec)
                    _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
                }
                return _monthsParse;
            }(sk__months, sk__monthsShort),
            weekdays: 'nede\u013ea_pondelok_utorok_streda_\u0161tvrtok_piatok_sobota'.split('_'),
            weekdaysShort: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
            weekdaysMin: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[dnes o] LT',
                nextDay: '[zajtra o] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[v nede\u013eu o] LT';
                    case 1:
                    case 2:
                        return '[v] dddd [o] LT';
                    case 3:
                        return '[v stredu o] LT';
                    case 4:
                        return '[vo \u0161tvrtok o] LT';
                    case 5:
                        return '[v piatok o] LT';
                    case 6:
                        return '[v sobotu o] LT';
                    }
                },
                lastDay: '[v\u010dera o] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[minul\xfa nede\u013eu o] LT';
                    case 1:
                    case 2:
                        return '[minul\xfd] dddd [o] LT';
                    case 3:
                        return '[minul\xfa stredu o] LT';
                    case 4:
                    case 5:
                        return '[minul\xfd] dddd [o] LT';
                    case 6:
                        return '[minul\xfa sobotu o] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: 'pred %s',
                s: sk__translate,
                m: sk__translate,
                mm: sk__translate,
                h: sk__translate,
                hh: sk__translate,
                d: sk__translate,
                dd: sk__translate,
                M: sk__translate,
                MM: sk__translate,
                y: sk__translate,
                yy: sk__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : slovenian (sl)
    //! author : Robert Sedovšek : https://github.com/sedovsek
    function sl__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nekaj sekund' : 'nekaj sekundami';
        case 'm':
            return withoutSuffix ? 'ena minuta' : 'eno minuto';
        case 'mm':
            if (number === 1) {
                result += withoutSuffix ? 'minuta' : 'minuto';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'minuti' : 'minutama';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'minute' : 'minutami';
            } else {
                result += withoutSuffix || isFuture ? 'minut' : 'minutami';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'ena ura' : 'eno uro';
        case 'hh':
            if (number === 1) {
                result += withoutSuffix ? 'ura' : 'uro';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'uri' : 'urama';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'ure' : 'urami';
            } else {
                result += withoutSuffix || isFuture ? 'ur' : 'urami';
            }
            return result;
        case 'd':
            return withoutSuffix || isFuture ? 'en dan' : 'enim dnem';
        case 'dd':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'dan' : 'dnem';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'dni' : 'dnevoma';
            } else {
                result += withoutSuffix || isFuture ? 'dni' : 'dnevi';
            }
            return result;
        case 'M':
            return withoutSuffix || isFuture ? 'en mesec' : 'enim mesecem';
        case 'MM':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'mesec' : 'mesecem';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'meseca' : 'mesecema';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'mesece' : 'meseci';
            } else {
                result += withoutSuffix || isFuture ? 'mesecev' : 'meseci';
            }
            return result;
        case 'y':
            return withoutSuffix || isFuture ? 'eno leto' : 'enim letom';
        case 'yy':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'leto' : 'letom';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'leti' : 'letoma';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'leta' : 'leti';
            } else {
                result += withoutSuffix || isFuture ? 'let' : 'leti';
            }
            return result;
        }
    }
    var sl = _moment__default.defineLocale('sl', {
            months: 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
            monthsShort: 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
            weekdays: 'nedelja_ponedeljek_torek_sreda_\u010detrtek_petek_sobota'.split('_'),
            weekdaysShort: 'ned._pon._tor._sre._\u010det._pet._sob.'.split('_'),
            weekdaysMin: 'ne_po_to_sr_\u010de_pe_so'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[danes ob] LT',
                nextDay: '[jutri ob] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[v] [nedeljo] [ob] LT';
                    case 3:
                        return '[v] [sredo] [ob] LT';
                    case 6:
                        return '[v] [soboto] [ob] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[v] dddd [ob] LT';
                    }
                },
                lastDay: '[v\u010deraj ob] LT',
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[prej\u0161njo] [nedeljo] [ob] LT';
                    case 3:
                        return '[prej\u0161njo] [sredo] [ob] LT';
                    case 6:
                        return '[prej\u0161njo] [soboto] [ob] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[prej\u0161nji] dddd [ob] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u010dez %s',
                past: 'pred %s',
                s: sl__processRelativeTime,
                m: sl__processRelativeTime,
                mm: sl__processRelativeTime,
                h: sl__processRelativeTime,
                hh: sl__processRelativeTime,
                d: sl__processRelativeTime,
                dd: sl__processRelativeTime,
                M: sl__processRelativeTime,
                MM: sl__processRelativeTime,
                y: sl__processRelativeTime,
                yy: sl__processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Albanian (sq)
    //! author : Flakërim Ismani : https://github.com/flakerimi
    //! author: Menelion Elensúle: https://github.com/Oire (tests)
    //! author : Oerd Cukalla : https://github.com/oerd (fixes)
    var sq = _moment__default.defineLocale('sq', {
            months: 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_N\xebntor_Dhjetor'.split('_'),
            monthsShort: 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_N\xebn_Dhj'.split('_'),
            weekdays: 'E Diel_E H\xebn\xeb_E Mart\xeb_E M\xebrkur\xeb_E Enjte_E Premte_E Shtun\xeb'.split('_'),
            weekdaysShort: 'Die_H\xebn_Mar_M\xebr_Enj_Pre_Sht'.split('_'),
            weekdaysMin: 'D_H_Ma_M\xeb_E_P_Sh'.split('_'),
            meridiemParse: /PD|MD/,
            isPM: function (input) {
                return input.charAt(0) === 'M';
            },
            meridiem: function (hours, minutes, isLower) {
                return hours < 12 ? 'PD' : 'MD';
            },
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Sot n\xeb] LT',
                nextDay: '[Nes\xebr n\xeb] LT',
                nextWeek: 'dddd [n\xeb] LT',
                lastDay: '[Dje n\xeb] LT',
                lastWeek: 'dddd [e kaluar n\xeb] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'n\xeb %s',
                past: '%s m\xeb par\xeb',
                s: 'disa sekonda',
                m: 'nj\xeb minut\xeb',
                mm: '%d minuta',
                h: 'nj\xeb or\xeb',
                hh: '%d or\xeb',
                d: 'nj\xeb dit\xeb',
                dd: '%d dit\xeb',
                M: 'nj\xeb muaj',
                MM: '%d muaj',
                y: 'nj\xeb vit',
                yy: '%d vite'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : Serbian-cyrillic (sr-cyrl)
    //! author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j
    var sr_cyrl__translator = {
            words: {
                m: [
                    '\u0458\u0435\u0434\u0430\u043d \u043c\u0438\u043d\u0443\u0442',
                    '\u0458\u0435\u0434\u043d\u0435 \u043c\u0438\u043d\u0443\u0442\u0435'
                ],
                mm: [
                    '\u043c\u0438\u043d\u0443\u0442',
                    '\u043c\u0438\u043d\u0443\u0442\u0435',
                    '\u043c\u0438\u043d\u0443\u0442\u0430'
                ],
                h: [
                    '\u0458\u0435\u0434\u0430\u043d \u0441\u0430\u0442',
                    '\u0458\u0435\u0434\u043d\u043e\u0433 \u0441\u0430\u0442\u0430'
                ],
                hh: [
                    '\u0441\u0430\u0442',
                    '\u0441\u0430\u0442\u0430',
                    '\u0441\u0430\u0442\u0438'
                ],
                dd: [
                    '\u0434\u0430\u043d',
                    '\u0434\u0430\u043d\u0430',
                    '\u0434\u0430\u043d\u0430'
                ],
                MM: [
                    '\u043c\u0435\u0441\u0435\u0446',
                    '\u043c\u0435\u0441\u0435\u0446\u0430',
                    '\u043c\u0435\u0441\u0435\u0446\u0438'
                ],
                yy: [
                    '\u0433\u043e\u0434\u0438\u043d\u0430',
                    '\u0433\u043e\u0434\u0438\u043d\u0435',
                    '\u0433\u043e\u0434\u0438\u043d\u0430'
                ]
            },
            correctGrammaticalCase: function (number, wordKey) {
                return number === 1 ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
            },
            translate: function (number, withoutSuffix, key) {
                var wordKey = sr_cyrl__translator.words[key];
                if (key.length === 1) {
                    return withoutSuffix ? wordKey[0] : wordKey[1];
                } else {
                    return number + ' ' + sr_cyrl__translator.correctGrammaticalCase(number, wordKey);
                }
            }
        };
    var sr_cyrl = _moment__default.defineLocale('sr-cyrl', {
            months: [
                '\u0458\u0430\u043d\u0443\u0430\u0440',
                '\u0444\u0435\u0431\u0440\u0443\u0430\u0440',
                '\u043c\u0430\u0440\u0442',
                '\u0430\u043f\u0440\u0438\u043b',
                '\u043c\u0430\u0458',
                '\u0458\u0443\u043d',
                '\u0458\u0443\u043b',
                '\u0430\u0432\u0433\u0443\u0441\u0442',
                '\u0441\u0435\u043f\u0442\u0435\u043c\u0431\u0430\u0440',
                '\u043e\u043a\u0442\u043e\u0431\u0430\u0440',
                '\u043d\u043e\u0432\u0435\u043c\u0431\u0430\u0440',
                '\u0434\u0435\u0446\u0435\u043c\u0431\u0430\u0440'
            ],
            monthsShort: [
                '\u0458\u0430\u043d.',
                '\u0444\u0435\u0431.',
                '\u043c\u0430\u0440.',
                '\u0430\u043f\u0440.',
                '\u043c\u0430\u0458',
                '\u0458\u0443\u043d',
                '\u0458\u0443\u043b',
                '\u0430\u0432\u0433.',
                '\u0441\u0435\u043f.',
                '\u043e\u043a\u0442.',
                '\u043d\u043e\u0432.',
                '\u0434\u0435\u0446.'
            ],
            weekdays: [
                '\u043d\u0435\u0434\u0435\u0459\u0430',
                '\u043f\u043e\u043d\u0435\u0434\u0435\u0459\u0430\u043a',
                '\u0443\u0442\u043e\u0440\u0430\u043a',
                '\u0441\u0440\u0435\u0434\u0430',
                '\u0447\u0435\u0442\u0432\u0440\u0442\u0430\u043a',
                '\u043f\u0435\u0442\u0430\u043a',
                '\u0441\u0443\u0431\u043e\u0442\u0430'
            ],
            weekdaysShort: [
                '\u043d\u0435\u0434.',
                '\u043f\u043e\u043d.',
                '\u0443\u0442\u043e.',
                '\u0441\u0440\u0435.',
                '\u0447\u0435\u0442.',
                '\u043f\u0435\u0442.',
                '\u0441\u0443\u0431.'
            ],
            weekdaysMin: [
                '\u043d\u0435',
                '\u043f\u043e',
                '\u0443\u0442',
                '\u0441\u0440',
                '\u0447\u0435',
                '\u043f\u0435',
                '\u0441\u0443'
            ],
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[\u0434\u0430\u043d\u0430\u0441 \u0443] LT',
                nextDay: '[\u0441\u0443\u0442\u0440\u0430 \u0443] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[\u0443] [\u043d\u0435\u0434\u0435\u0459\u0443] [\u0443] LT';
                    case 3:
                        return '[\u0443] [\u0441\u0440\u0435\u0434\u0443] [\u0443] LT';
                    case 6:
                        return '[\u0443] [\u0441\u0443\u0431\u043e\u0442\u0443] [\u0443] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[\u0443] dddd [\u0443] LT';
                    }
                },
                lastDay: '[\u0458\u0443\u0447\u0435 \u0443] LT',
                lastWeek: function () {
                    var lastWeekDays = [
                            '[\u043f\u0440\u043e\u0448\u043b\u0435] [\u043d\u0435\u0434\u0435\u0459\u0435] [\u0443] LT',
                            '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u043f\u043e\u043d\u0435\u0434\u0435\u0459\u043a\u0430] [\u0443] LT',
                            '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u0443\u0442\u043e\u0440\u043a\u0430] [\u0443] LT',
                            '[\u043f\u0440\u043e\u0448\u043b\u0435] [\u0441\u0440\u0435\u0434\u0435] [\u0443] LT',
                            '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u0447\u0435\u0442\u0432\u0440\u0442\u043a\u0430] [\u0443] LT',
                            '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u043f\u0435\u0442\u043a\u0430] [\u0443] LT',
                            '[\u043f\u0440\u043e\u0448\u043b\u0435] [\u0441\u0443\u0431\u043e\u0442\u0435] [\u0443] LT'
                        ];
                    return lastWeekDays[this.day()];
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0437\u0430 %s',
                past: '\u043f\u0440\u0435 %s',
                s: '\u043d\u0435\u043a\u043e\u043b\u0438\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
                m: sr_cyrl__translator.translate,
                mm: sr_cyrl__translator.translate,
                h: sr_cyrl__translator.translate,
                hh: sr_cyrl__translator.translate,
                d: '\u0434\u0430\u043d',
                dd: sr_cyrl__translator.translate,
                M: '\u043c\u0435\u0441\u0435\u0446',
                MM: sr_cyrl__translator.translate,
                y: '\u0433\u043e\u0434\u0438\u043d\u0443',
                yy: sr_cyrl__translator.translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : Serbian-latin (sr)
    //! author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j
    var sr__translator = {
            words: {
                m: [
                    'jedan minut',
                    'jedne minute'
                ],
                mm: [
                    'minut',
                    'minute',
                    'minuta'
                ],
                h: [
                    'jedan sat',
                    'jednog sata'
                ],
                hh: [
                    'sat',
                    'sata',
                    'sati'
                ],
                dd: [
                    'dan',
                    'dana',
                    'dana'
                ],
                MM: [
                    'mesec',
                    'meseca',
                    'meseci'
                ],
                yy: [
                    'godina',
                    'godine',
                    'godina'
                ]
            },
            correctGrammaticalCase: function (number, wordKey) {
                return number === 1 ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
            },
            translate: function (number, withoutSuffix, key) {
                var wordKey = sr__translator.words[key];
                if (key.length === 1) {
                    return withoutSuffix ? wordKey[0] : wordKey[1];
                } else {
                    return number + ' ' + sr__translator.correctGrammaticalCase(number, wordKey);
                }
            }
        };
    var sr = _moment__default.defineLocale('sr', {
            months: [
                'januar',
                'februar',
                'mart',
                'april',
                'maj',
                'jun',
                'jul',
                'avgust',
                'septembar',
                'oktobar',
                'novembar',
                'decembar'
            ],
            monthsShort: [
                'jan.',
                'feb.',
                'mar.',
                'apr.',
                'maj',
                'jun',
                'jul',
                'avg.',
                'sep.',
                'okt.',
                'nov.',
                'dec.'
            ],
            weekdays: [
                'nedelja',
                'ponedeljak',
                'utorak',
                'sreda',
                '\u010detvrtak',
                'petak',
                'subota'
            ],
            weekdaysShort: [
                'ned.',
                'pon.',
                'uto.',
                'sre.',
                '\u010det.',
                'pet.',
                'sub.'
            ],
            weekdaysMin: [
                'ne',
                'po',
                'ut',
                'sr',
                '\u010de',
                'pe',
                'su'
            ],
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm'
            },
            calendar: {
                sameDay: '[danas u] LT',
                nextDay: '[sutra u] LT',
                nextWeek: function () {
                    switch (this.day()) {
                    case 0:
                        return '[u] [nedelju] [u] LT';
                    case 3:
                        return '[u] [sredu] [u] LT';
                    case 6:
                        return '[u] [subotu] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[u] dddd [u] LT';
                    }
                },
                lastDay: '[ju\u010de u] LT',
                lastWeek: function () {
                    var lastWeekDays = [
                            '[pro\u0161le] [nedelje] [u] LT',
                            '[pro\u0161log] [ponedeljka] [u] LT',
                            '[pro\u0161log] [utorka] [u] LT',
                            '[pro\u0161le] [srede] [u] LT',
                            '[pro\u0161log] [\u010detvrtka] [u] LT',
                            '[pro\u0161log] [petka] [u] LT',
                            '[pro\u0161le] [subote] [u] LT'
                        ];
                    return lastWeekDays[this.day()];
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: 'pre %s',
                s: 'nekoliko sekundi',
                m: sr__translator.translate,
                mm: sr__translator.translate,
                h: sr__translator.translate,
                hh: sr__translator.translate,
                d: 'dan',
                dd: sr__translator.translate,
                M: 'mesec',
                MM: sr__translator.translate,
                y: 'godinu',
                yy: sr__translator.translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : swedish (sv)
    //! author : Jens Alm : https://github.com/ulmus
    var sv = _moment__default.defineLocale('sv', {
            months: 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
            monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
            weekdays: 's\xf6ndag_m\xe5ndag_tisdag_onsdag_torsdag_fredag_l\xf6rdag'.split('_'),
            weekdaysShort: 's\xf6n_m\xe5n_tis_ons_tor_fre_l\xf6r'.split('_'),
            weekdaysMin: 's\xf6_m\xe5_ti_on_to_fr_l\xf6'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Idag] LT',
                nextDay: '[Imorgon] LT',
                lastDay: '[Ig\xe5r] LT',
                nextWeek: '[P\xe5] dddd LT',
                lastWeek: '[I] dddd[s] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'om %s',
                past: 'f\xf6r %s sedan',
                s: 'n\xe5gra sekunder',
                m: 'en minut',
                mm: '%d minuter',
                h: 'en timme',
                hh: '%d timmar',
                d: 'en dag',
                dd: '%d dagar',
                M: 'en m\xe5nad',
                MM: '%d m\xe5nader',
                y: 'ett \xe5r',
                yy: '%d \xe5r'
            },
            ordinalParse: /\d{1,2}(e|a)/,
            ordinal: function (number) {
                var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'e' : b === 1 ? 'a' : b === 2 ? 'a' : b === 3 ? 'e' : 'e';
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : tamil (ta)
    //! author : Arjunkumar Krishnamoorthy : https://github.com/tk120404
    var ta = _moment__default.defineLocale('ta', {
            months: '\u0b9c\u0ba9\u0bb5\u0bb0\u0bbf_\u0baa\u0bbf\u0baa\u0bcd\u0bb0\u0bb5\u0bb0\u0bbf_\u0bae\u0bbe\u0bb0\u0bcd\u0b9a\u0bcd_\u0b8f\u0baa\u0bcd\u0bb0\u0bb2\u0bcd_\u0bae\u0bc7_\u0b9c\u0bc2\u0ba9\u0bcd_\u0b9c\u0bc2\u0bb2\u0bc8_\u0b86\u0b95\u0bb8\u0bcd\u0b9f\u0bcd_\u0b9a\u0bc6\u0baa\u0bcd\u0b9f\u0bc6\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b85\u0b95\u0bcd\u0b9f\u0bc7\u0bbe\u0baa\u0bb0\u0bcd_\u0ba8\u0bb5\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b9f\u0bbf\u0b9a\u0bae\u0bcd\u0baa\u0bb0\u0bcd'.split('_'),
            monthsShort: '\u0b9c\u0ba9\u0bb5\u0bb0\u0bbf_\u0baa\u0bbf\u0baa\u0bcd\u0bb0\u0bb5\u0bb0\u0bbf_\u0bae\u0bbe\u0bb0\u0bcd\u0b9a\u0bcd_\u0b8f\u0baa\u0bcd\u0bb0\u0bb2\u0bcd_\u0bae\u0bc7_\u0b9c\u0bc2\u0ba9\u0bcd_\u0b9c\u0bc2\u0bb2\u0bc8_\u0b86\u0b95\u0bb8\u0bcd\u0b9f\u0bcd_\u0b9a\u0bc6\u0baa\u0bcd\u0b9f\u0bc6\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b85\u0b95\u0bcd\u0b9f\u0bc7\u0bbe\u0baa\u0bb0\u0bcd_\u0ba8\u0bb5\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b9f\u0bbf\u0b9a\u0bae\u0bcd\u0baa\u0bb0\u0bcd'.split('_'),
            weekdays: '\u0b9e\u0bbe\u0baf\u0bbf\u0bb1\u0bcd\u0bb1\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0ba4\u0bbf\u0b99\u0bcd\u0b95\u0b9f\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0b9a\u0bc6\u0bb5\u0bcd\u0bb5\u0bbe\u0baf\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0baa\u0bc1\u0ba4\u0ba9\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0bb5\u0bbf\u0baf\u0bbe\u0bb4\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0bb5\u0bc6\u0bb3\u0bcd\u0bb3\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0b9a\u0ba9\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8'.split('_'),
            weekdaysShort: '\u0b9e\u0bbe\u0baf\u0bbf\u0bb1\u0bc1_\u0ba4\u0bbf\u0b99\u0bcd\u0b95\u0bb3\u0bcd_\u0b9a\u0bc6\u0bb5\u0bcd\u0bb5\u0bbe\u0baf\u0bcd_\u0baa\u0bc1\u0ba4\u0ba9\u0bcd_\u0bb5\u0bbf\u0baf\u0bbe\u0bb4\u0ba9\u0bcd_\u0bb5\u0bc6\u0bb3\u0bcd\u0bb3\u0bbf_\u0b9a\u0ba9\u0bbf'.split('_'),
            weekdaysMin: '\u0b9e\u0bbe_\u0ba4\u0bbf_\u0b9a\u0bc6_\u0baa\u0bc1_\u0bb5\u0bbf_\u0bb5\u0bc6_\u0b9a'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, HH:mm',
                LLLL: 'dddd, D MMMM YYYY, HH:mm'
            },
            calendar: {
                sameDay: '[\u0b87\u0ba9\u0bcd\u0bb1\u0bc1] LT',
                nextDay: '[\u0ba8\u0bbe\u0bb3\u0bc8] LT',
                nextWeek: 'dddd, LT',
                lastDay: '[\u0ba8\u0bc7\u0bb1\u0bcd\u0bb1\u0bc1] LT',
                lastWeek: '[\u0b95\u0b9f\u0ba8\u0bcd\u0ba4 \u0bb5\u0bbe\u0bb0\u0bae\u0bcd] dddd, LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s \u0b87\u0bb2\u0bcd',
                past: '%s \u0bae\u0bc1\u0ba9\u0bcd',
                s: '\u0b92\u0bb0\u0bc1 \u0b9a\u0bbf\u0bb2 \u0bb5\u0bbf\u0ba8\u0bbe\u0b9f\u0bbf\u0b95\u0bb3\u0bcd',
                m: '\u0b92\u0bb0\u0bc1 \u0ba8\u0bbf\u0bae\u0bbf\u0b9f\u0bae\u0bcd',
                mm: '%d \u0ba8\u0bbf\u0bae\u0bbf\u0b9f\u0b99\u0bcd\u0b95\u0bb3\u0bcd',
                h: '\u0b92\u0bb0\u0bc1 \u0bae\u0ba3\u0bbf \u0ba8\u0bc7\u0bb0\u0bae\u0bcd',
                hh: '%d \u0bae\u0ba3\u0bbf \u0ba8\u0bc7\u0bb0\u0bae\u0bcd',
                d: '\u0b92\u0bb0\u0bc1 \u0ba8\u0bbe\u0bb3\u0bcd',
                dd: '%d \u0ba8\u0bbe\u0b9f\u0bcd\u0b95\u0bb3\u0bcd',
                M: '\u0b92\u0bb0\u0bc1 \u0bae\u0bbe\u0ba4\u0bae\u0bcd',
                MM: '%d \u0bae\u0bbe\u0ba4\u0b99\u0bcd\u0b95\u0bb3\u0bcd',
                y: '\u0b92\u0bb0\u0bc1 \u0bb5\u0bb0\u0bc1\u0b9f\u0bae\u0bcd',
                yy: '%d \u0b86\u0ba3\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd'
            },
            ordinalParse: /\d{1,2}வது/,
            ordinal: function (number) {
                return number + '\u0bb5\u0ba4\u0bc1';
            },
            meridiemParse: /யாமம்|வைகறை|காலை|நண்பகல்|எற்பாடு|மாலை/,
            meridiem: function (hour, minute, isLower) {
                if (hour < 2) {
                    return ' \u0baf\u0bbe\u0bae\u0bae\u0bcd';
                } else if (hour < 6) {
                    return ' \u0bb5\u0bc8\u0b95\u0bb1\u0bc8';    // வைகறை
                } else if (hour < 10) {
                    return ' \u0b95\u0bbe\u0bb2\u0bc8';    // காலை
                } else if (hour < 14) {
                    return ' \u0ba8\u0ba3\u0bcd\u0baa\u0b95\u0bb2\u0bcd';    // நண்பகல்
                } else if (hour < 18) {
                    return ' \u0b8e\u0bb1\u0bcd\u0baa\u0bbe\u0b9f\u0bc1';    // எற்பாடு
                } else if (hour < 22) {
                    return ' \u0bae\u0bbe\u0bb2\u0bc8';    // மாலை
                } else {
                    return ' \u0baf\u0bbe\u0bae\u0bae\u0bcd';
                }
            },
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === '\u0baf\u0bbe\u0bae\u0bae\u0bcd') {
                    return hour < 2 ? hour : hour + 12;
                } else if (meridiem === '\u0bb5\u0bc8\u0b95\u0bb1\u0bc8' || meridiem === '\u0b95\u0bbe\u0bb2\u0bc8') {
                    return hour;
                } else if (meridiem === '\u0ba8\u0ba3\u0bcd\u0baa\u0b95\u0bb2\u0bcd') {
                    return hour >= 10 ? hour : hour + 12;
                } else {
                    return hour + 12;
                }
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    //! moment.js locale configuration
    //! locale : thai (th)
    //! author : Kridsada Thanabulpong : https://github.com/sirn
    var th = _moment__default.defineLocale('th', {
            months: '\u0e21\u0e01\u0e23\u0e32\u0e04\u0e21_\u0e01\u0e38\u0e21\u0e20\u0e32\u0e1e\u0e31\u0e19\u0e18\u0e4c_\u0e21\u0e35\u0e19\u0e32\u0e04\u0e21_\u0e40\u0e21\u0e29\u0e32\u0e22\u0e19_\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21_\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32\u0e22\u0e19_\u0e01\u0e23\u0e01\u0e0e\u0e32\u0e04\u0e21_\u0e2a\u0e34\u0e07\u0e2b\u0e32\u0e04\u0e21_\u0e01\u0e31\u0e19\u0e22\u0e32\u0e22\u0e19_\u0e15\u0e38\u0e25\u0e32\u0e04\u0e21_\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32\u0e22\u0e19_\u0e18\u0e31\u0e19\u0e27\u0e32\u0e04\u0e21'.split('_'),
            monthsShort: '\u0e21\u0e01\u0e23\u0e32_\u0e01\u0e38\u0e21\u0e20\u0e32_\u0e21\u0e35\u0e19\u0e32_\u0e40\u0e21\u0e29\u0e32_\u0e1e\u0e24\u0e29\u0e20\u0e32_\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32_\u0e01\u0e23\u0e01\u0e0e\u0e32_\u0e2a\u0e34\u0e07\u0e2b\u0e32_\u0e01\u0e31\u0e19\u0e22\u0e32_\u0e15\u0e38\u0e25\u0e32_\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32_\u0e18\u0e31\u0e19\u0e27\u0e32'.split('_'),
            weekdays: '\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c_\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c_\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23_\u0e1e\u0e38\u0e18_\u0e1e\u0e24\u0e2b\u0e31\u0e2a\u0e1a\u0e14\u0e35_\u0e28\u0e38\u0e01\u0e23\u0e4c_\u0e40\u0e2a\u0e32\u0e23\u0e4c'.split('_'),
            weekdaysShort: '\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c_\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c_\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23_\u0e1e\u0e38\u0e18_\u0e1e\u0e24\u0e2b\u0e31\u0e2a_\u0e28\u0e38\u0e01\u0e23\u0e4c_\u0e40\u0e2a\u0e32\u0e23\u0e4c'.split('_'),
            weekdaysMin: '\u0e2d\u0e32._\u0e08._\u0e2d._\u0e1e._\u0e1e\u0e24._\u0e28._\u0e2a.'.split('_'),
            longDateFormat: {
                LT: 'H \u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32 m \u0e19\u0e32\u0e17\u0e35',
                LTS: 'H \u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32 m \u0e19\u0e32\u0e17\u0e35 s \u0e27\u0e34\u0e19\u0e32\u0e17\u0e35',
                L: 'YYYY/MM/DD',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 H \u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32 m \u0e19\u0e32\u0e17\u0e35',
                LLLL: '\u0e27\u0e31\u0e19dddd\u0e17\u0e35\u0e48 D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 H \u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32 m \u0e19\u0e32\u0e17\u0e35'
            },
            meridiemParse: /ก่อนเที่ยง|หลังเที่ยง/,
            isPM: function (input) {
                return input === '\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07';
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 12) {
                    return '\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07';
                } else {
                    return '\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07';
                }
            },
            calendar: {
                sameDay: '[\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
                nextDay: '[\u0e1e\u0e23\u0e38\u0e48\u0e07\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
                nextWeek: 'dddd[\u0e2b\u0e19\u0e49\u0e32 \u0e40\u0e27\u0e25\u0e32] LT',
                lastDay: '[\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e27\u0e32\u0e19\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
                lastWeek: '[\u0e27\u0e31\u0e19]dddd[\u0e17\u0e35\u0e48\u0e41\u0e25\u0e49\u0e27 \u0e40\u0e27\u0e25\u0e32] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0e2d\u0e35\u0e01 %s',
                past: '%s\u0e17\u0e35\u0e48\u0e41\u0e25\u0e49\u0e27',
                s: '\u0e44\u0e21\u0e48\u0e01\u0e35\u0e48\u0e27\u0e34\u0e19\u0e32\u0e17\u0e35',
                m: '1 \u0e19\u0e32\u0e17\u0e35',
                mm: '%d \u0e19\u0e32\u0e17\u0e35',
                h: '1 \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07',
                hh: '%d \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07',
                d: '1 \u0e27\u0e31\u0e19',
                dd: '%d \u0e27\u0e31\u0e19',
                M: '1 \u0e40\u0e14\u0e37\u0e2d\u0e19',
                MM: '%d \u0e40\u0e14\u0e37\u0e2d\u0e19',
                y: '1 \u0e1b\u0e35',
                yy: '%d \u0e1b\u0e35'
            }
        });
    //! moment.js locale configuration
    //! locale : Tagalog/Filipino (tl-ph)
    //! author : Dan Hagman
    var tl_ph = _moment__default.defineLocale('tl-ph', {
            months: 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
            monthsShort: 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
            weekdays: 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
            weekdaysShort: 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
            weekdaysMin: 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'MM/D/YYYY',
                LL: 'MMMM D, YYYY',
                LLL: 'MMMM D, YYYY HH:mm',
                LLLL: 'dddd, MMMM DD, YYYY HH:mm'
            },
            calendar: {
                sameDay: '[Ngayon sa] LT',
                nextDay: '[Bukas sa] LT',
                nextWeek: 'dddd [sa] LT',
                lastDay: '[Kahapon sa] LT',
                lastWeek: 'dddd [huling linggo] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'sa loob ng %s',
                past: '%s ang nakalipas',
                s: 'ilang segundo',
                m: 'isang minuto',
                mm: '%d minuto',
                h: 'isang oras',
                hh: '%d oras',
                d: 'isang araw',
                dd: '%d araw',
                M: 'isang buwan',
                MM: '%d buwan',
                y: 'isang taon',
                yy: '%d taon'
            },
            ordinalParse: /\d{1,2}/,
            ordinal: function (number) {
                return number;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : turkish (tr)
    //! authors : Erhan Gundogan : https://github.com/erhangundogan,
    //!           Burak Yiğit Kaya: https://github.com/BYK
    var tr__suffixes = {
            1: "'inci",
            5: "'inci",
            8: "'inci",
            70: "'inci",
            80: "'inci",
            2: "'nci",
            7: "'nci",
            20: "'nci",
            50: "'nci",
            3: "'\xfcnc\xfc",
            4: "'\xfcnc\xfc",
            100: "'\xfcnc\xfc",
            6: "'nc\u0131",
            9: "'uncu",
            10: "'uncu",
            30: "'uncu",
            60: "'\u0131nc\u0131",
            90: "'\u0131nc\u0131"
        };
    var tr = _moment__default.defineLocale('tr', {
            months: 'Ocak_\u015eubat_Mart_Nisan_May\u0131s_Haziran_Temmuz_A\u011fustos_Eyl\xfcl_Ekim_Kas\u0131m_Aral\u0131k'.split('_'),
            monthsShort: 'Oca_\u015eub_Mar_Nis_May_Haz_Tem_A\u011fu_Eyl_Eki_Kas_Ara'.split('_'),
            weekdays: 'Pazar_Pazartesi_Sal\u0131_\xc7ar\u015famba_Per\u015fembe_Cuma_Cumartesi'.split('_'),
            weekdaysShort: 'Paz_Pts_Sal_\xc7ar_Per_Cum_Cts'.split('_'),
            weekdaysMin: 'Pz_Pt_Sa_\xc7a_Pe_Cu_Ct'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[bug\xfcn saat] LT',
                nextDay: '[yar\u0131n saat] LT',
                nextWeek: '[haftaya] dddd [saat] LT',
                lastDay: '[d\xfcn] LT',
                lastWeek: '[ge\xe7en hafta] dddd [saat] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s sonra',
                past: '%s \xf6nce',
                s: 'birka\xe7 saniye',
                m: 'bir dakika',
                mm: '%d dakika',
                h: 'bir saat',
                hh: '%d saat',
                d: 'bir g\xfcn',
                dd: '%d g\xfcn',
                M: 'bir ay',
                MM: '%d ay',
                y: 'bir y\u0131l',
                yy: '%d y\u0131l'
            },
            ordinalParse: /\d{1,2}'(inci|nci|üncü|ncı|uncu|ıncı)/,
            ordinal: function (number) {
                if (number === 0) {
                    // special case for zero
                    return number + "'\u0131nc\u0131";
                }
                var a = number % 10, b = number % 100 - a, c = number >= 100 ? 100 : null;
                return number + (tr__suffixes[a] || tr__suffixes[b] || tr__suffixes[c]);
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : talossan (tzl)
    //! author : Robin van der Vliet : https://github.com/robin0van0der0v with the help of Iustì Canun
    var tzl = _moment__default.defineLocale('tzl', {
            months: 'Januar_Fevraglh_Mar\xe7_Avr\xefu_Mai_G\xfcn_Julia_Guscht_Setemvar_Listop\xe4ts_Noemvar_Zecemvar'.split('_'),
            monthsShort: 'Jan_Fev_Mar_Avr_Mai_G\xfcn_Jul_Gus_Set_Lis_Noe_Zec'.split('_'),
            weekdays: 'S\xfaladi_L\xfane\xe7i_Maitzi_M\xe1rcuri_Xh\xfaadi_Vi\xe9ner\xe7i_S\xe1turi'.split('_'),
            weekdaysShort: 'S\xfal_L\xfan_Mai_M\xe1r_Xh\xfa_Vi\xe9_S\xe1t'.split('_'),
            weekdaysMin: 'S\xfa_L\xfa_Ma_M\xe1_Xh_Vi_S\xe1'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'LT.ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM [dallas] YYYY',
                LLL: 'D. MMMM [dallas] YYYY LT',
                LLLL: 'dddd, [li] D. MMMM [dallas] YYYY LT'
            },
            meridiem: function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? "d'o" : "D'O";
                } else {
                    return isLower ? "d'a" : "D'A";
                }
            },
            calendar: {
                sameDay: '[oxhi \xe0] LT',
                nextDay: '[dem\xe0 \xe0] LT',
                nextWeek: 'dddd [\xe0] LT',
                lastDay: '[ieiri \xe0] LT',
                lastWeek: '[s\xfcr el] dddd [lasteu \xe0] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'osprei %s',
                past: 'ja%s',
                s: tzl__processRelativeTime,
                m: tzl__processRelativeTime,
                mm: tzl__processRelativeTime,
                h: tzl__processRelativeTime,
                hh: tzl__processRelativeTime,
                d: tzl__processRelativeTime,
                dd: tzl__processRelativeTime,
                M: tzl__processRelativeTime,
                MM: tzl__processRelativeTime,
                y: tzl__processRelativeTime,
                yy: tzl__processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1,
                doy: 4
            }
        });
    function tzl__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
                's': [
                    'viensas secunds',
                    "'iensas secunds"
                ],
                'm': [
                    "'n m\xedut",
                    "'iens m\xedut"
                ],
                'mm': [
                    number + ' m\xeduts',
                    ' ' + number + ' m\xeduts'
                ],
                'h': [
                    "'n \xfeora",
                    "'iensa \xfeora"
                ],
                'hh': [
                    number + ' \xfeoras',
                    ' ' + number + ' \xfeoras'
                ],
                'd': [
                    "'n ziua",
                    "'iensa ziua"
                ],
                'dd': [
                    number + ' ziuas',
                    ' ' + number + ' ziuas'
                ],
                'M': [
                    "'n mes",
                    "'iens mes"
                ],
                'MM': [
                    number + ' mesen',
                    ' ' + number + ' mesen'
                ],
                'y': [
                    "'n ar",
                    "'iens ar"
                ],
                'yy': [
                    number + ' ars',
                    ' ' + number + ' ars'
                ]
            };
        return isFuture ? format[key][0] : withoutSuffix ? format[key][0] : format[key][1].trim();
    }
    //! moment.js locale configuration
    //! locale : Morocco Central Atlas Tamaziɣt in Latin (tzm-latn)
    //! author : Abdel Said : https://github.com/abdelsaid
    var tzm_latn = _moment__default.defineLocale('tzm-latn', {
            months: 'innayr_br\u02e4ayr\u02e4_mar\u02e4s\u02e4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02e4wbr\u02e4_nwwanbir_dwjnbir'.split('_'),
            monthsShort: 'innayr_br\u02e4ayr\u02e4_mar\u02e4s\u02e4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02e4wbr\u02e4_nwwanbir_dwjnbir'.split('_'),
            weekdays: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split('_'),
            weekdaysShort: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split('_'),
            weekdaysMin: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[asdkh g] LT',
                nextDay: '[aska g] LT',
                nextWeek: 'dddd [g] LT',
                lastDay: '[assant g] LT',
                lastWeek: 'dddd [g] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'dadkh s yan %s',
                past: 'yan %s',
                s: 'imik',
                m: 'minu\u1e0d',
                mm: '%d minu\u1e0d',
                h: 'sa\u025ba',
                hh: '%d tassa\u025bin',
                d: 'ass',
                dd: '%d ossan',
                M: 'ayowr',
                MM: '%d iyyirn',
                y: 'asgas',
                yy: '%d isgasn'
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    //! moment.js locale configuration
    //! locale : Morocco Central Atlas Tamaziɣt (tzm)
    //! author : Abdel Said : https://github.com/abdelsaid
    var tzm = _moment__default.defineLocale('tzm', {
            months: '\u2d49\u2d4f\u2d4f\u2d30\u2d62\u2d54_\u2d31\u2d55\u2d30\u2d62\u2d55_\u2d4e\u2d30\u2d55\u2d5a_\u2d49\u2d31\u2d54\u2d49\u2d54_\u2d4e\u2d30\u2d62\u2d62\u2d53_\u2d62\u2d53\u2d4f\u2d62\u2d53_\u2d62\u2d53\u2d4d\u2d62\u2d53\u2d63_\u2d56\u2d53\u2d5b\u2d5c_\u2d5b\u2d53\u2d5c\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d3d\u2d5f\u2d53\u2d31\u2d55_\u2d4f\u2d53\u2d61\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d37\u2d53\u2d4a\u2d4f\u2d31\u2d49\u2d54'.split('_'),
            monthsShort: '\u2d49\u2d4f\u2d4f\u2d30\u2d62\u2d54_\u2d31\u2d55\u2d30\u2d62\u2d55_\u2d4e\u2d30\u2d55\u2d5a_\u2d49\u2d31\u2d54\u2d49\u2d54_\u2d4e\u2d30\u2d62\u2d62\u2d53_\u2d62\u2d53\u2d4f\u2d62\u2d53_\u2d62\u2d53\u2d4d\u2d62\u2d53\u2d63_\u2d56\u2d53\u2d5b\u2d5c_\u2d5b\u2d53\u2d5c\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d3d\u2d5f\u2d53\u2d31\u2d55_\u2d4f\u2d53\u2d61\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d37\u2d53\u2d4a\u2d4f\u2d31\u2d49\u2d54'.split('_'),
            weekdays: '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split('_'),
            weekdaysShort: '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split('_'),
            weekdaysMin: '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[\u2d30\u2d59\u2d37\u2d45 \u2d34] LT',
                nextDay: '[\u2d30\u2d59\u2d3d\u2d30 \u2d34] LT',
                nextWeek: 'dddd [\u2d34] LT',
                lastDay: '[\u2d30\u2d5a\u2d30\u2d4f\u2d5c \u2d34] LT',
                lastWeek: 'dddd [\u2d34] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u2d37\u2d30\u2d37\u2d45 \u2d59 \u2d62\u2d30\u2d4f %s',
                past: '\u2d62\u2d30\u2d4f %s',
                s: '\u2d49\u2d4e\u2d49\u2d3d',
                m: '\u2d4e\u2d49\u2d4f\u2d53\u2d3a',
                mm: '%d \u2d4e\u2d49\u2d4f\u2d53\u2d3a',
                h: '\u2d59\u2d30\u2d44\u2d30',
                hh: '%d \u2d5c\u2d30\u2d59\u2d59\u2d30\u2d44\u2d49\u2d4f',
                d: '\u2d30\u2d59\u2d59',
                dd: '%d o\u2d59\u2d59\u2d30\u2d4f',
                M: '\u2d30\u2d62o\u2d53\u2d54',
                MM: '%d \u2d49\u2d62\u2d62\u2d49\u2d54\u2d4f',
                y: '\u2d30\u2d59\u2d33\u2d30\u2d59',
                yy: '%d \u2d49\u2d59\u2d33\u2d30\u2d59\u2d4f'
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    //! moment.js locale configuration
    //! locale : ukrainian (uk)
    //! author : zemlanin : https://github.com/zemlanin
    //! Author : Menelion Elensúle : https://github.com/Oire
    function uk__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
    }
    function uk__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': '\u0445\u0432\u0438\u043b\u0438\u043d\u0430_\u0445\u0432\u0438\u043b\u0438\u043d\u0438_\u0445\u0432\u0438\u043b\u0438\u043d',
                'hh': '\u0433\u043e\u0434\u0438\u043d\u0430_\u0433\u043e\u0434\u0438\u043d\u0438_\u0433\u043e\u0434\u0438\u043d',
                'dd': '\u0434\u0435\u043d\u044c_\u0434\u043d\u0456_\u0434\u043d\u0456\u0432',
                'MM': '\u043c\u0456\u0441\u044f\u0446\u044c_\u043c\u0456\u0441\u044f\u0446\u0456_\u043c\u0456\u0441\u044f\u0446\u0456\u0432',
                'yy': '\u0440\u0456\u043a_\u0440\u043e\u043a\u0438_\u0440\u043e\u043a\u0456\u0432'
            };
        if (key === 'm') {
            return withoutSuffix ? '\u0445\u0432\u0438\u043b\u0438\u043d\u0430' : '\u0445\u0432\u0438\u043b\u0438\u043d\u0443';
        } else if (key === 'h') {
            return withoutSuffix ? '\u0433\u043e\u0434\u0438\u043d\u0430' : '\u0433\u043e\u0434\u0438\u043d\u0443';
        } else {
            return number + ' ' + uk__plural(format[key], +number);
        }
    }
    function uk__monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u0441\u0456\u0447\u0435\u043d\u044c_\u043b\u044e\u0442\u0438\u0439_\u0431\u0435\u0440\u0435\u0437\u0435\u043d\u044c_\u043a\u0432\u0456\u0442\u0435\u043d\u044c_\u0442\u0440\u0430\u0432\u0435\u043d\u044c_\u0447\u0435\u0440\u0432\u0435\u043d\u044c_\u043b\u0438\u043f\u0435\u043d\u044c_\u0441\u0435\u0440\u043f\u0435\u043d\u044c_\u0432\u0435\u0440\u0435\u0441\u0435\u043d\u044c_\u0436\u043e\u0432\u0442\u0435\u043d\u044c_\u043b\u0438\u0441\u0442\u043e\u043f\u0430\u0434_\u0433\u0440\u0443\u0434\u0435\u043d\u044c'.split('_'),
                'accusative': '\u0441\u0456\u0447\u043d\u044f_\u043b\u044e\u0442\u043e\u0433\u043e_\u0431\u0435\u0440\u0435\u0437\u043d\u044f_\u043a\u0432\u0456\u0442\u043d\u044f_\u0442\u0440\u0430\u0432\u043d\u044f_\u0447\u0435\u0440\u0432\u043d\u044f_\u043b\u0438\u043f\u043d\u044f_\u0441\u0435\u0440\u043f\u043d\u044f_\u0432\u0435\u0440\u0435\u0441\u043d\u044f_\u0436\u043e\u0432\u0442\u043d\u044f_\u043b\u0438\u0441\u0442\u043e\u043f\u0430\u0434\u0430_\u0433\u0440\u0443\u0434\u043d\u044f'.split('_')
            }, nounCase = /D[oD]? *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function uk__weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u043d\u0435\u0434\u0456\u043b\u044f_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043e\u043a_\u0432\u0456\u0432\u0442\u043e\u0440\u043e\u043a_\u0441\u0435\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u044f_\u0441\u0443\u0431\u043e\u0442\u0430'.split('_'),
                'accusative': '\u043d\u0435\u0434\u0456\u043b\u044e_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043e\u043a_\u0432\u0456\u0432\u0442\u043e\u0440\u043e\u043a_\u0441\u0435\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u044e_\u0441\u0443\u0431\u043e\u0442\u0443'.split('_'),
                'genitive': '\u043d\u0435\u0434\u0456\u043b\u0456_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043a\u0430_\u0432\u0456\u0432\u0442\u043e\u0440\u043a\u0430_\u0441\u0435\u0440\u0435\u0434\u0438_\u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u0456_\u0441\u0443\u0431\u043e\u0442\u0438'.split('_')
            }, nounCase = /(\[[ВвУу]\]) ?dddd/.test(format) ? 'accusative' : /\[?(?:минулої|наступної)? ?\] ?dddd/.test(format) ? 'genitive' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    function processHoursFunction(str) {
        return function () {
            return str + '\u043e' + (this.hours() === 11 ? '\u0431' : '') + '] LT';
        };
    }
    var uk = _moment__default.defineLocale('uk', {
            months: uk__monthsCaseReplace,
            monthsShort: '\u0441\u0456\u0447_\u043b\u044e\u0442_\u0431\u0435\u0440_\u043a\u0432\u0456\u0442_\u0442\u0440\u0430\u0432_\u0447\u0435\u0440\u0432_\u043b\u0438\u043f_\u0441\u0435\u0440\u043f_\u0432\u0435\u0440_\u0436\u043e\u0432\u0442_\u043b\u0438\u0441\u0442_\u0433\u0440\u0443\u0434'.split('_'),
            weekdays: uk__weekdaysCaseReplace,
            weekdaysShort: '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
            weekdaysMin: '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY \u0440.',
                LLL: 'D MMMM YYYY \u0440., HH:mm',
                LLLL: 'dddd, D MMMM YYYY \u0440., HH:mm'
            },
            calendar: {
                sameDay: processHoursFunction('[\u0421\u044c\u043e\u0433\u043e\u0434\u043d\u0456 '),
                nextDay: processHoursFunction('[\u0417\u0430\u0432\u0442\u0440\u0430 '),
                lastDay: processHoursFunction('[\u0412\u0447\u043e\u0440\u0430 '),
                nextWeek: processHoursFunction('[\u0423] dddd ['),
                lastWeek: function () {
                    switch (this.day()) {
                    case 0:
                    case 3:
                    case 5:
                    case 6:
                        return processHoursFunction('[\u041c\u0438\u043d\u0443\u043b\u043e\u0457] dddd [').call(this);
                    case 1:
                    case 2:
                    case 4:
                        return processHoursFunction('[\u041c\u0438\u043d\u0443\u043b\u043e\u0433\u043e] dddd [').call(this);
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u0437\u0430 %s',
                past: '%s \u0442\u043e\u043c\u0443',
                s: '\u0434\u0435\u043a\u0456\u043b\u044c\u043a\u0430 \u0441\u0435\u043a\u0443\u043d\u0434',
                m: uk__relativeTimeWithPlural,
                mm: uk__relativeTimeWithPlural,
                h: '\u0433\u043e\u0434\u0438\u043d\u0443',
                hh: uk__relativeTimeWithPlural,
                d: '\u0434\u0435\u043d\u044c',
                dd: uk__relativeTimeWithPlural,
                M: '\u043c\u0456\u0441\u044f\u0446\u044c',
                MM: uk__relativeTimeWithPlural,
                y: '\u0440\u0456\u043a',
                yy: uk__relativeTimeWithPlural
            },
            meridiemParse: /ночі|ранку|дня|вечора/,
            isPM: function (input) {
                return /^(дня|вечора)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return '\u043d\u043e\u0447\u0456';
                } else if (hour < 12) {
                    return '\u0440\u0430\u043d\u043a\u0443';
                } else if (hour < 17) {
                    return '\u0434\u043d\u044f';
                } else {
                    return '\u0432\u0435\u0447\u043e\u0440\u0430';
                }
            },
            ordinalParse: /\d{1,2}-(й|го)/,
            ordinal: function (number, period) {
                switch (period) {
                case 'M':
                case 'd':
                case 'DDD':
                case 'w':
                case 'W':
                    return number + '-\u0439';
                case 'D':
                    return number + '-\u0433\u043e';
                default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : uzbek (uz)
    //! author : Sardor Muminov : https://github.com/muminoff
    var uz = _moment__default.defineLocale('uz', {
            months: '\u044f\u043d\u0432\u0430\u0440\u044c_\u0444\u0435\u0432\u0440\u0430\u043b\u044c_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0435\u043b\u044c_\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c_\u043e\u043a\u0442\u044f\u0431\u0440\u044c_\u043d\u043e\u044f\u0431\u0440\u044c_\u0434\u0435\u043a\u0430\u0431\u0440\u044c'.split('_'),
            monthsShort: '\u044f\u043d\u0432_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0439_\u0438\u044e\u043d_\u0438\u044e\u043b_\u0430\u0432\u0433_\u0441\u0435\u043d_\u043e\u043a\u0442_\u043d\u043e\u044f_\u0434\u0435\u043a'.split('_'),
            weekdays: '\u042f\u043a\u0448\u0430\u043d\u0431\u0430_\u0414\u0443\u0448\u0430\u043d\u0431\u0430_\u0421\u0435\u0448\u0430\u043d\u0431\u0430_\u0427\u043e\u0440\u0448\u0430\u043d\u0431\u0430_\u041f\u0430\u0439\u0448\u0430\u043d\u0431\u0430_\u0416\u0443\u043c\u0430_\u0428\u0430\u043d\u0431\u0430'.split('_'),
            weekdaysShort: '\u042f\u043a\u0448_\u0414\u0443\u0448_\u0421\u0435\u0448_\u0427\u043e\u0440_\u041f\u0430\u0439_\u0416\u0443\u043c_\u0428\u0430\u043d'.split('_'),
            weekdaysMin: '\u042f\u043a_\u0414\u0443_\u0421\u0435_\u0427\u043e_\u041f\u0430_\u0416\u0443_\u0428\u0430'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'D MMMM YYYY, dddd HH:mm'
            },
            calendar: {
                sameDay: '[\u0411\u0443\u0433\u0443\u043d \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                nextDay: '[\u042d\u0440\u0442\u0430\u0433\u0430] LT [\u0434\u0430]',
                nextWeek: 'dddd [\u043a\u0443\u043d\u0438 \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                lastDay: '[\u041a\u0435\u0447\u0430 \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                lastWeek: '[\u0423\u0442\u0433\u0430\u043d] dddd [\u043a\u0443\u043d\u0438 \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                sameElse: 'L'
            },
            relativeTime: {
                future: '\u042f\u043a\u0438\u043d %s \u0438\u0447\u0438\u0434\u0430',
                past: '\u0411\u0438\u0440 \u043d\u0435\u0447\u0430 %s \u043e\u043b\u0434\u0438\u043d',
                s: '\u0444\u0443\u0440\u0441\u0430\u0442',
                m: '\u0431\u0438\u0440 \u0434\u0430\u043a\u0438\u043a\u0430',
                mm: '%d \u0434\u0430\u043a\u0438\u043a\u0430',
                h: '\u0431\u0438\u0440 \u0441\u043e\u0430\u0442',
                hh: '%d \u0441\u043e\u0430\u0442',
                d: '\u0431\u0438\u0440 \u043a\u0443\u043d',
                dd: '%d \u043a\u0443\u043d',
                M: '\u0431\u0438\u0440 \u043e\u0439',
                MM: '%d \u043e\u0439',
                y: '\u0431\u0438\u0440 \u0439\u0438\u043b',
                yy: '%d \u0439\u0438\u043b'
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    //! moment.js locale configuration
    //! locale : vietnamese (vi)
    //! author : Bang Nguyen : https://github.com/bangnk
    var vi = _moment__default.defineLocale('vi', {
            months: 'th\xe1ng 1_th\xe1ng 2_th\xe1ng 3_th\xe1ng 4_th\xe1ng 5_th\xe1ng 6_th\xe1ng 7_th\xe1ng 8_th\xe1ng 9_th\xe1ng 10_th\xe1ng 11_th\xe1ng 12'.split('_'),
            monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
            weekdays: 'ch\u1ee7 nh\u1eadt_th\u1ee9 hai_th\u1ee9 ba_th\u1ee9 t\u01b0_th\u1ee9 n\u0103m_th\u1ee9 s\xe1u_th\u1ee9 b\u1ea3y'.split('_'),
            weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
            weekdaysMin: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM [n\u0103m] YYYY',
                LLL: 'D MMMM [n\u0103m] YYYY HH:mm',
                LLLL: 'dddd, D MMMM [n\u0103m] YYYY HH:mm',
                l: 'DD/M/YYYY',
                ll: 'D MMM YYYY',
                lll: 'D MMM YYYY HH:mm',
                llll: 'ddd, D MMM YYYY HH:mm'
            },
            calendar: {
                sameDay: '[H\xf4m nay l\xfac] LT',
                nextDay: '[Ng\xe0y mai l\xfac] LT',
                nextWeek: 'dddd [tu\u1ea7n t\u1edbi l\xfac] LT',
                lastDay: '[H\xf4m qua l\xfac] LT',
                lastWeek: 'dddd [tu\u1ea7n r\u1ed3i l\xfac] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%s t\u1edbi',
                past: '%s tr\u01b0\u1edbc',
                s: 'v\xe0i gi\xe2y',
                m: 'm\u1ed9t ph\xfat',
                mm: '%d ph\xfat',
                h: 'm\u1ed9t gi\u1edd',
                hh: '%d gi\u1edd',
                d: 'm\u1ed9t ng\xe0y',
                dd: '%d ng\xe0y',
                M: 'm\u1ed9t th\xe1ng',
                MM: '%d th\xe1ng',
                y: 'm\u1ed9t n\u0103m',
                yy: '%d n\u0103m'
            },
            ordinalParse: /\d{1,2}/,
            ordinal: function (number) {
                return number;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : chinese (zh-cn)
    //! author : suupic : https://github.com/suupic
    //! author : Zeno Zeng : https://github.com/zenozeng
    var zh_cn = _moment__default.defineLocale('zh-cn', {
            months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split('_'),
            monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
            weekdays: '\u661f\u671f\u65e5_\u661f\u671f\u4e00_\u661f\u671f\u4e8c_\u661f\u671f\u4e09_\u661f\u671f\u56db_\u661f\u671f\u4e94_\u661f\u671f\u516d'.split('_'),
            weekdaysShort: '\u5468\u65e5_\u5468\u4e00_\u5468\u4e8c_\u5468\u4e09_\u5468\u56db_\u5468\u4e94_\u5468\u516d'.split('_'),
            weekdaysMin: '\u65e5_\u4e00_\u4e8c_\u4e09_\u56db_\u4e94_\u516d'.split('_'),
            longDateFormat: {
                LT: 'Ah\u70b9mm\u5206',
                LTS: 'Ah\u70b9m\u5206s\u79d2',
                L: 'YYYY-MM-DD',
                LL: 'YYYY\u5e74MMMD\u65e5',
                LLL: 'YYYY\u5e74MMMD\u65e5Ah\u70b9mm\u5206',
                LLLL: 'YYYY\u5e74MMMD\u65e5ddddAh\u70b9mm\u5206',
                l: 'YYYY-MM-DD',
                ll: 'YYYY\u5e74MMMD\u65e5',
                lll: 'YYYY\u5e74MMMD\u65e5Ah\u70b9mm\u5206',
                llll: 'YYYY\u5e74MMMD\u65e5ddddAh\u70b9mm\u5206'
            },
            meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === '\u51cc\u6668' || meridiem === '\u65e9\u4e0a' || meridiem === '\u4e0a\u5348') {
                    return hour;
                } else if (meridiem === '\u4e0b\u5348' || meridiem === '\u665a\u4e0a') {
                    return hour + 12;
                } else {
                    // '中午'
                    return hour >= 11 ? hour : hour + 12;
                }
            },
            meridiem: function (hour, minute, isLower) {
                var hm = hour * 100 + minute;
                if (hm < 600) {
                    return '\u51cc\u6668';
                } else if (hm < 900) {
                    return '\u65e9\u4e0a';
                } else if (hm < 1130) {
                    return '\u4e0a\u5348';
                } else if (hm < 1230) {
                    return '\u4e2d\u5348';
                } else if (hm < 1800) {
                    return '\u4e0b\u5348';
                } else {
                    return '\u665a\u4e0a';
                }
            },
            calendar: {
                sameDay: function () {
                    return this.minutes() === 0 ? '[\u4eca\u5929]Ah[\u70b9\u6574]' : '[\u4eca\u5929]LT';
                },
                nextDay: function () {
                    return this.minutes() === 0 ? '[\u660e\u5929]Ah[\u70b9\u6574]' : '[\u660e\u5929]LT';
                },
                lastDay: function () {
                    return this.minutes() === 0 ? '[\u6628\u5929]Ah[\u70b9\u6574]' : '[\u6628\u5929]LT';
                },
                nextWeek: function () {
                    var startOfWeek, prefix;
                    startOfWeek = _moment__default().startOf('week');
                    prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[\u4e0b]' : '[\u672c]';
                    return this.minutes() === 0 ? prefix + 'dddAh\u70b9\u6574' : prefix + 'dddAh\u70b9mm';
                },
                lastWeek: function () {
                    var startOfWeek, prefix;
                    startOfWeek = _moment__default().startOf('week');
                    prefix = this.unix() < startOfWeek.unix() ? '[\u4e0a]' : '[\u672c]';
                    return this.minutes() === 0 ? prefix + 'dddAh\u70b9\u6574' : prefix + 'dddAh\u70b9mm';
                },
                sameElse: 'LL'
            },
            ordinalParse: /\d{1,2}(日|月|周)/,
            ordinal: function (number, period) {
                switch (period) {
                case 'd':
                case 'D':
                case 'DDD':
                    return number + '\u65e5';
                case 'M':
                    return number + '\u6708';
                case 'w':
                case 'W':
                    return number + '\u5468';
                default:
                    return number;
                }
            },
            relativeTime: {
                future: '%s\u5185',
                past: '%s\u524d',
                s: '\u51e0\u79d2',
                m: '1 \u5206\u949f',
                mm: '%d \u5206\u949f',
                h: '1 \u5c0f\u65f6',
                hh: '%d \u5c0f\u65f6',
                d: '1 \u5929',
                dd: '%d \u5929',
                M: '1 \u4e2a\u6708',
                MM: '%d \u4e2a\u6708',
                y: '1 \u5e74',
                yy: '%d \u5e74'
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    //! moment.js locale configuration
    //! locale : traditional chinese (zh-tw)
    //! author : Ben : https://github.com/ben-lin
    var zh_tw = _moment__default.defineLocale('zh-tw', {
            months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split('_'),
            monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
            weekdays: '\u661f\u671f\u65e5_\u661f\u671f\u4e00_\u661f\u671f\u4e8c_\u661f\u671f\u4e09_\u661f\u671f\u56db_\u661f\u671f\u4e94_\u661f\u671f\u516d'.split('_'),
            weekdaysShort: '\u9031\u65e5_\u9031\u4e00_\u9031\u4e8c_\u9031\u4e09_\u9031\u56db_\u9031\u4e94_\u9031\u516d'.split('_'),
            weekdaysMin: '\u65e5_\u4e00_\u4e8c_\u4e09_\u56db_\u4e94_\u516d'.split('_'),
            longDateFormat: {
                LT: 'Ah\u9edemm\u5206',
                LTS: 'Ah\u9edem\u5206s\u79d2',
                L: 'YYYY\u5e74MMMD\u65e5',
                LL: 'YYYY\u5e74MMMD\u65e5',
                LLL: 'YYYY\u5e74MMMD\u65e5Ah\u9edemm\u5206',
                LLLL: 'YYYY\u5e74MMMD\u65e5ddddAh\u9edemm\u5206',
                l: 'YYYY\u5e74MMMD\u65e5',
                ll: 'YYYY\u5e74MMMD\u65e5',
                lll: 'YYYY\u5e74MMMD\u65e5Ah\u9edemm\u5206',
                llll: 'YYYY\u5e74MMMD\u65e5ddddAh\u9edemm\u5206'
            },
            meridiemParse: /早上|上午|中午|下午|晚上/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === '\u65e9\u4e0a' || meridiem === '\u4e0a\u5348') {
                    return hour;
                } else if (meridiem === '\u4e2d\u5348') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === '\u4e0b\u5348' || meridiem === '\u665a\u4e0a') {
                    return hour + 12;
                }
            },
            meridiem: function (hour, minute, isLower) {
                var hm = hour * 100 + minute;
                if (hm < 900) {
                    return '\u65e9\u4e0a';
                } else if (hm < 1130) {
                    return '\u4e0a\u5348';
                } else if (hm < 1230) {
                    return '\u4e2d\u5348';
                } else if (hm < 1800) {
                    return '\u4e0b\u5348';
                } else {
                    return '\u665a\u4e0a';
                }
            },
            calendar: {
                sameDay: '[\u4eca\u5929]LT',
                nextDay: '[\u660e\u5929]LT',
                nextWeek: '[\u4e0b]ddddLT',
                lastDay: '[\u6628\u5929]LT',
                lastWeek: '[\u4e0a]ddddLT',
                sameElse: 'L'
            },
            ordinalParse: /\d{1,2}(日|月|週)/,
            ordinal: function (number, period) {
                switch (period) {
                case 'd':
                case 'D':
                case 'DDD':
                    return number + '\u65e5';
                case 'M':
                    return number + '\u6708';
                case 'w':
                case 'W':
                    return number + '\u9031';
                default:
                    return number;
                }
            },
            relativeTime: {
                future: '%s\u5167',
                past: '%s\u524d',
                s: '\u5e7e\u79d2',
                m: '\u4e00\u5206\u9418',
                mm: '%d\u5206\u9418',
                h: '\u4e00\u5c0f\u6642',
                hh: '%d\u5c0f\u6642',
                d: '\u4e00\u5929',
                dd: '%d\u5929',
                M: '\u4e00\u500b\u6708',
                MM: '%d\u500b\u6708',
                y: '\u4e00\u5e74',
                yy: '%d\u5e74'
            }
        });
    var moment_with_locales = _moment__default;
    moment_with_locales.locale('en');
    return moment_with_locales;
}));