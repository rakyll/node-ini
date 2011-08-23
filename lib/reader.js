var fs   = require('fs'),
    util = require('util');

var regex = {
    clean: /(\s*[#;].*$|^\s*$)/gm,
    line: /[\r\n]+/,
    section: /^\s*\[\s*([\w]+)(?:\s*:\s*([\w]+))?\s*\]\s*$/,
    keyvalue: /^\s*([\w\.]+(?:\[\])?)\s*[:=]\s*(.*)\s*$/
};

var defaultSection = 'default';

function extend(dest, source) {
    for (var prop in source) {
        dest[prop] = source[prop];
    }
    return dest;
}

function isNan(value) {
    return value !== value;
}

function export(source, path, value) {
    var parts = path.split('.'), key, i, len;
    // try to cast the value into a number
    value = isNan(parseInt(value)) ? value : parseInt(value);
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
};

var IniParser = function(data) {
    var ini = null, section = defaultSection;

    var parseLine = function(line) {
        var matches;
        if (null !== (matches = line.match(regex.keyvalue))) {
            ini[section] = ini[section] || {};
            export(ini[section], matches[1], matches[2]);
        } else if (null !== (matches = line.match(regex.section))) {
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

var parseFile = function(filename, callback) {
    fs.readFile(filename, 'utf-8', function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        parse(data, callback);
    });
};

var parseSync = function(data) {
    var parser = new IniParser(data);
    return parser.parseSync();
};

var parseFileSync = function(filename) {
    var data = fs.readFileSync(filename, 'utf-8');
    return parseSync(data);
};


module.exports = {
    // let the user set his own conf
    regex: regex,
    defaultSection: defaultSection,
    parse: parse,
    parseFile: parseFile,
    parseSync: parseSync,
    parseFileSync: parseFileSync
};
