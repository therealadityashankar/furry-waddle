var fw = require("./main");
require("./errors");
require("./furry");
require("./waddle");
require("./erry");
require("./countii");
require("./css")

if(typeof(window) !== "undefined")
    window.furrywaddle = fw;
else{
    module.exports = fw;
}
