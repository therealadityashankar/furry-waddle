var fw = require("./main.js")
var pages = require("html-pages");
pages.Furry = class extends pages.PageContainer{}
customElements.define("furry", pages.Furry)
