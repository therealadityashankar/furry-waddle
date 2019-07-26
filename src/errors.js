if(typeof(window) === "undefined"){
    var fw = {};
} else var fw = require("./main");
fw.FurryError = class extends Error{};
fw.BadNameError = class extends fw.FurryError{};
fw.BadConnectedElementError = class extends fw.FurryError{};

// for testing purposes
if(typeof(window) === "undefined"){
    module.exports = {fw};
}
