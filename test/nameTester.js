var parseName = require("../src/nameParser");
var fw = require("../src/errors.js");
var assert = require('assert');

function checkValues(values, wantedValues){
    assert.equal(values.length, wantedValues.length, "lengths dont match!");
    for(var i = 0;i<values.length;i++){
        var val = values[i];
        var wantedVal = wantedValues[i]
        assert.equal(val,
                     wantedVal,
                     `values ${val} and ${wantedVal} don't match`);
        assert.equal(typeof(val), typeof(wantedVal), 'type of ${val} and ${wantedVal don\'t match');
    }
}

describe('nameParser', function(){
    it('parses form names', function(){
        var test1 = parseName("abcd['fgh']");
        checkValues(test1, ['abcd', 'fgh']);

        var test2 = parseName("abcd[fgh]");
        checkValues(test2, ['abcd', 'fgh']);

        var test3 = parseName("abcd[fgh]['def'][ijk]");
        checkValues(test3, ['abcd', 'fgh', 'def', 'ijk']);

        var test3_5 = parseName("[abcd][fgh]['def'][ijk]");
        checkValues(test3_5, ['abcd', 'fgh', 'def', 'ijk']);

        var test4 = parseName("abcd.fgh");
        checkValues(test4, ['abcd', 'fgh']);

        var test5 = parseName("abcd.fgh['def'][ijk]");
        checkValues(test5, ['abcd', 'fgh', 'def', 'ijk']);

        var test6 = parseName("abcd.efg[hij][3]");
        checkValues(test6, ['abcd', 'efg', 'hij', 3]);

        var test7 = () => parseName("abcd.efg[hij");
        assert.throws(test7, fw.BadNameError);

        var test8 = () => parseName("abcd.efg[\"hij]");
        assert.throws(test7, fw.BadNameError);

        var test9 = () => parseName("abc'd.efg[\"hij]");
        assert.throws(test8, fw.BadNameError);
    });
});
