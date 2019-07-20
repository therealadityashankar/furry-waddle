# furry-waddle
multipage, json supporting forms!

## features
- submit json items directly over forms!
- multi page forms!

## usage
- a `<fw-furry>` is a form
- a `<fw-waddle>` is a small page
- the `<next-page>` button takes you to the next page!
- the `<prev-page>` and `<nav-page>` from my html-pages project work in the same way!
- you don't need to have a wadle

```html
<fw-furry action="https://localhost:4567/">
  <fw-waddle>
    <input type="text" name="firstname" required></input>
    <input type="text" name="lastname"></input>
  </fw-waddle>
  <fw-waddle>
    <input type="text" name="addr[0]" required></input>
    <input type="text" name="addr[1]" required></input>
  </fw-waddle>
  <fw-waddle>
    <input type="tel" name="phone.abc" required></input>
    <input type="submit">
  </fw-waddle>
  <next-page>
</fw-furry>
```
