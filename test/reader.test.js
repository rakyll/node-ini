var reader   = require('ini').reader,
    should   = require('should'),
    expected = require(__dirname + '/file.js'),
    fs       = require('fs'),
    data     = fs.readFileSync(__dirname + '/file.ini', 'utf-8');

module.exports = {
    'parse file sync': function() {
        var ini = reader.parseFileSync(__dirname + '/file.ini');
        should.deepEqual(ini, expected);
    },
    'parse string sync': function() {
        var ini = reader.parseSync(data);
        should.deepEqual(ini, expected);
    },
    'parse file async': function() {
        reader.parseFile(__dirname + '/file.ini', function(err, ini) {
            should.deepEqual(ini, expected);
        });
        reader.parseFile('unknown.file', function(err, ini) {
            should.exist(err);
        });
    },
    'parse string async': function() {
        reader.parse(data, function(err, ini) {
            should.deepEqual(ini, expected);
        });
    }
};
