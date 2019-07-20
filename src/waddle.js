var fw = require("./main.js");
var pages = require("html-pages");
fw.Waddle = class extends pages.NormalPageElement{
    constructor(){
        super();
    }
}

customElements.define('fw-waddle', fw.Waddle);
