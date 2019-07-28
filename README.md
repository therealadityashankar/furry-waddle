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

### super basic usage, without waddles
```html
<fw-furry id="fw3" action="https://localhost:4567/">
    <p>username</p>
    <input type="text" name="user.username" required>
    <p>password</p>
    <input type="password" name="user.password" required
           placeholder="********">
    <input type="submit">
</fw-furry>
```

### with waddles
a waddle is essentially like a part page
for a form, so that instead of having the whole form
at once, you can show parts of the form one by one,
the only way the user can move to the next page is by
properly completing the form, and then moving ahead

this gives a cleaner outlook to the form

```html
<fw-furry id="fw3" action="https://localhost:4567/">
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
  <next-page page-el="#fw3">next</next-page>
  <prev-page page-el="#fw3">previous</prev-page>
</fw-furry>
```

### with page containers,
this whole project was build in accordance with my other project, html-pages, so in a super project with many forms (like any normal project)
you can directly navigate to another page using these, without ANY javascript code

```html
<page-container>
  <n-page>
    <fw-furry id="fw3" action="https://localhost:4567/" on-submit="mola">
        <p>username</p>
        <input type="text" name="user.username" required>
        <p>password</p>
        <input type="password" name="user.password" required
               placeholder="********">
        <input type="submit">
    </fw-furry>
  </n-page>
  <n-page pname="mola">
    <!-- some content here -->
  </n-page>
</page-container>
```
