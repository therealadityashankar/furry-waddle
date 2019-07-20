var fw = require("./main");
require("./errors")
require("./furry")
require("./waddle")

if(typeof(window) !== "undefined")
    window.furrywaddle = fw;
else{
    module.exports = fw;
}
