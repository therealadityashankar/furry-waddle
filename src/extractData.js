var parseName = require("./nameParser.js");
/**
 * extract data from a fw-furry object
 *
 * convert it to json
 */
function extractData(furry){
    var inputs = furry.getElementsByTagName('input');
    // supported input types (those not marked TODO)
    // checkbox, color, date, datetime-local, email, file,
    // hidden, image, month, number, password, radio, range,
    // reset - TODO, search, tel, text, time, url, week
    var values = {}
    for(var input of inputs){
        if(!["radio", "checkbox", "submit"].includes(input.type)){
            values[input.name] = input.value;
        } else if(["radio", "checkbox"].includes(input.type)){
            if(input.checked){
                values[input.name] = input.value;
            }
        }
    }

    return values
}

function extractFurryData(furry){
    var rawData = extractData(furry);
    var formattedData = {};

    for(var key in rawData){
        /* I'm converting the keys to proper
           jsons here
        
           later check if all names are numbers
           then convert the json into an array */
        var splitKey = parseName(key);
        console.log(splitKey);
        var trueKey = splitKey[splitKey.length - 1];

        // turn every previous container into a js object
        var currData = formattedData;
        for(var i=0; i<(splitKey.length - 1); i++){
            var name = splitKey[i];
            var nextName = splitKey[i+1];

            // if container is empty
            if(currData[name] == undefined){
                // if not string assume integer
                if(typeof(nextName) == "string") currData[name] = {};
                else currData[name] = [];
            } 
            currData = currData[name];
        }

        // finally assign the last key the value
        if(currData[trueKey] === undefined){
            currData[trueKey] = rawData[key];
        }
        else{
            throw new fw.BadNameError(`one of the keys (${name}) has already been used as a name!, for the name in input ${key}`);
        }
    }
    return formattedData;
}

module.exports = {extractFurryData};
