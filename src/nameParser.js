var fw = require("./main");

function nameParser(name){
    var parts = [];
    var textEnded = false;
    var currPos = 0;

    function gulpChar(){
        var char = name[currPos];
        currPos += 1;
        if(char === undefined){
            textEnded = true;
        }
        return char;
    }

    function parserAssignable(char){
        return ["'","[",'"',"."].includes(char);
    }

    function assignParserForNormalParsing(char){
        if(char == '['){
            parseSquareBracket();
            return true;
        }
        else if(char == '"'||char == "'"){
            throw new fw.BadNameError("cant have quotes ('\"', \"'\" without square brackets '[]'");
        }
        else if(char == '.'){
            parseNormal();
            return true;
        }
        return false;
    }

    function parseNormal(){
        var currText = '';
        while(true){
            var char = gulpChar();

            // break if something else is
            // parsing it
            if(parserAssignable(char)){
                if(currText != '') parts.push(currText);
                assignParserForNormalParsing(char);
                break;
            }
            else if(textEnded){
                if(currText != '') parts.push(currText);
                break;
            }
            else{
                currText += char;
            }
        }
    }

    function parseSquareBracket(){
        var currText = '';
        while(true){
            var char = gulpChar();

            // break if text "]"
            if(char == "]"){
                if(currText != '') {
                    // strings get directly pushed
                    // https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number#175787
                    if(isNaN(currText)) parts.push(currText);
                    else {
                        // make sure it isn't a float
                        // https://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-float-or-integer
                        var number = parseFloat(currText);
                        var floatNumber = (number%1 === 0);
                        var intNumber = !floatNumber;
                        if(intNumber){
                            throw new fw.BadNameError(`floating point array values are not allowed, if you want this as a string, quote it!, error number here is ${number}`);
                        }
                        else{
                            parts.push(number);
                        }
                    }
                }
                else throw new fw.BadNameError('empty arrays are not allowed currently in names');
                // in case there is more coming up!
                parseNormal();
                break;
            }
            else if(char == '"'||char=="'"){
                parseString(char);
                var endBracket = gulpChar();
                if(endBracket != "]") throw new fw.BadNameError('missing end square bracket("]") in name after quote');
                // in case there is more
                parseNormal();
                break;
            }
            else if(textEnded){
                throw new fw.BadNameError('open square bracker ("[") without closing square bracket ("]")');
            }
            else{
                currText += char;
            }
        }

    }

    /** startQuote must be "'" or '"' indicating the starting type*/
    function parseString(startQuote){
        var currText = '';
        while(true){
            var char = gulpChar();
            if(char == startQuote){
                if (currText === '') throw new fw.BadNameError('name contains empty quoted string, that\'s not allowed');
                else{
                    parts.push(currText);
                    break;
                }
            }
            else if(textEnded){
                throw new fw.BadNameError(`opened quote ${startQuote} without closing it!`);
            }
            else{
                currText += char;
            }
        }
    }

    parseNormal(name);
    return parts;
}

module.exports = nameParser;
