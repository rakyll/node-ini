var ini      = require('ini'),
    should   = require('should'),
    expected = require(__dirname + '/file.js'),
    fs       = require('fs'),
    data     = fs.readFileSync(__dirname + '/file.ini', 'utf-8');

module.exports = {
    'parse file sync': function() {
        var value = ini.parseFileSync(__dirname + '/file.ini');
        should.deepEqual(value, expected);
    },
    'parse string sync': function() {
        var value = ini.parseSync(data);
        should.deepEqual(value, expected);
    },
    'parse file async': function() {
        ini.parseFile(__dirname + '/file.ini', function(err, value) {
            should.deepEqual(value, expected);
            should.not.exist(err);
        });
        ini.parseFile('unknown.file', function(err, value) {
            should.exist(err);
            should.not.exist(value);
        });
    },
    'parse string async': function() {
        ini.parse(data, function(err, value) {
            should.deepEqual(value, expected);
            should.not.exist(err);
        });
    },
    'parse default.foo.bar async': function() {
        ini.parse('foo = bar', function(err, value) {
            value.should.have.property('default');
            value['default'].should.have.property('foo', 'bar');
            should.not.exist(err);
        });
    }
};
