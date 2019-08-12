#!/usr/bin/env node
var fs = require('fs').promises;

async function main(){
  var cssJSFile = await fs.open("src/css.js", 'w');
  var preCssFile = await fs.open('src/css.js.pre');
  var cssContentF = await fs.open('src/furrywaddle.css');
  var cssContent = await cssContentF.readFile();
  var preCssJS = await preCssFile.readFile({encoding:'utf8'});

  var cssJS = preCssJS.replace("{{theCSStext}}", cssContent);
  await cssJSFile.write(cssJS);

  await cssJSFile.close();
  await preCssFile.close();
  await cssContentF.close();
}

main();
