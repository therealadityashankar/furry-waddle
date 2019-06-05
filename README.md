# furry-waddle
multipage, json supporting forms!

## features
- submit json items directly over forms!
- multi page forms!

## usage
- a `<furry>` is a form
- a `<waddle>` is a small page
- the `<next-page>` button takes you to the next page!
- you don't need to have a wadle

```html
<furry>
  <wadle>
    <input type="text" name="firstname" required></input>
    <input type="text" name="lastname"></input>
  </wadle>
  <wadle>
    <input type="text" name="addr1" required></input>
    <input type="text" name="addr2" required></input>
  </wadle>
  <wadle>
    <input type="tel" name="phone" required></input>
    <input type="submit>
  </wadle>
  <next-page>
</furry>
```
