var fs = require('fs');

var regex = {
    clean: /^(\s*[#;].*$|\s*$)/gm,
    line: /[\r\n]+/,
    section: /^\s*\[\s*([\w]+)(?:\s*:\s*([\w]+))?\s*\]\s*$/,
    keyvalue: /^\s*([\w\.]+(?:\[\])?)\s*[:=]\s*(.*\S)\s*$/
};

var defaultSection = 'default';

/**
 * Copy properties from source object to dest object
 * Return dest object
 */
function extend(dest, source) {
    for (var prop in source) {
        dest[prop] = source[prop];
    }
    return dest;
}

/**
 * Export value in the hierarchy defined by path
 * The root of the hierarchy is the source object
 * ex:
 *    export(section, 'foo.bar', 'baz')
 *    => section.foo.bar = 'baz'
 */
function export(source, path, value) {
    var parts = path.split('.'), key, i, len;
    for (i = 0, len = parts.length; i < len; i++) {
        key = parts[i];
        if (i == len - 1) {
            if (key.slice(-2) == '[]') {
                key = key.slice(0, -2);
                source[key] = Array.isArray(source[key]) ? source[key] : [];
                source[key].push(value);
            } else {
                source[key] = value;
            }
        } else {
            source[key] = source[key] || {};
        }
        source = source[key];
    }
}

var IniParser = function(data) {
    var ini = null, section = defaultSection;

    var parseLine = function(line) {
        var matches;
        if (null !== (matches = line.match(regex.keyvalue))) {
            // manage key value pair
            ini[section] = ini[section] || {};
            export(ini[section], matches[1], matches[2]);
        } else if (null !== (matches = line.match(regex.section))) {
            // manage section and inheritance (all sections are converted to lowercase)
            section = matches[1].toLowerCase()
            ini[section] = ini[section] || {};
            if (matches[2] != null) {
                extend(ini[section], ini[matches[2].toLowerCase()]);
            }
        }
    };

    var extractLines = function(data) {
        // clean comments and blank lines
        data = data.replace(regex.clean, '');
        lines = data.split(regex.line);
        // last line maybe a blank line
        if (lines[lines.length - 1].length == 0) {
            lines.pop();
        }
        return lines;
    };

    this.parse = function(callback) {
        ini = {};
        var lines = extractLines(data), todo = lines.length, done = 0;
        lines.forEach(function(line) {
            process.nextTick(function() {
                parseLine(line);
                done++;
                if (done == todo) {
                    callback(null, ini);
                }
            });
        });
    };

    this.parseSync = function() {
        ini = {};
        extractLines(data).forEach(parseLine);
        return ini;
    };
};

var parse = function(data, callback) {
    var parser = new IniParser(data);
    parser.parse(callback);
};

var parseSync = function(data) {
    var parser = new IniParser(data);
    return parser.parseSync();
};

exports.parseSync = parseSync;
exports.parseFileSync = function(filename) {
    var data = fs.readFileSync(filename, 'utf-8');
    return parseSync(data);
};

exports.parse = parse;
exports.parseFile = function(filename, callback) {
    fs.readFile(filename, 'utf-8', function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        parse(data, callback);
    });
};
