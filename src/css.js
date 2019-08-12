/** this is converted into css.js by building it,
basically furrywaddle.css is added where the "theCSStext" in the ""{{ }}""
is replaced and then into the final html */
document.addEventListener("DOMContentLoaded", _ => {
  var css = `/**
 * the css for furrywaddle
 * */
fw-furry{
    display: block;
    overflow: hidden;
    width: 200px;
    height: 200px;
}

fw-waddle{
    display: block;
    overflow: hidden;
    height: 100%;
    width: 100%;
}

fw-countii-up{
  background: teal;
}

fw-countii-down{
  background: pink;
}
`;
  var cssEl = document.createElement("style");
  cssEl.innerHTML = css;
  document.body.appendChild(cssEl);
})
