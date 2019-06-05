var fw = require("./main.js");
var pages = require("html-pages");
fw.waddle = class extends pages.NormalPageElement{
    constructor(){
        super();
    }
}

customElements.define('waddle', pages.FormPageElement);
