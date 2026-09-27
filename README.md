# javascript-foundation

Reference code for the [RizTech Academy JavaScript Complete Foundation
course](https://www.riztechacademy.com/learn/javascript-foundation) — a tiffin
service order tracker, built in module 10.

**Compare with this when you are stuck. Do not start from it.** The point of the
capstone is typing it yourself and fixing your own mistakes; a finished copy only
helps once you have something of your own to compare against.

No framework, no build step, no dependencies. Plain HTML, CSS and ES modules.

## Running it

ES modules must be served over HTTP — opening `index.html` from your file system
will not work. Any static server does:

```bash
npx serve
```

```bash
python3 -m http.server 8000
```

Then open the address it prints.

## What is in it

```
index.html          the markup
styles.css          the styling, including a dark mode
data/rates.json     the rate card, fetched at startup
src/
  app.js            wiring: listeners and startup
  state.js          the store — the array is the truth
  storage.js        localStorage with a fallback that cannot crash the page
  api.js            fetchJson: timeout, response.ok, three failure kinds
  errors.js         HttpError, NetworkError, TimeoutError, and their messages
  validate.js       form validation, converting at the boundary
  render.js         building the DOM from state
  format.js         rupees and dates via Intl
```

Imports point one way — `app` imports the rest, and nothing imports `app` — so
there are no circular imports.

## The decisions worth reading

**Money is counted in paise.** `80.10 * 3` is `240.29999999999998`, so every
amount is a whole number of paise and is converted only for display.

**Dates are built from local parts.** `toISOString().slice(0, 10)` gives the
*previous* day in IST, because local midnight is 18:30 the day before in UTC.

**The array is the truth; the page is a picture of it.** Every change updates
state, saves, and re-renders. Nothing is read back out of the DOM.

**`textContent` everywhere, never `innerHTML`.** Customer names and the fetched
rate card are both untrusted input. An inserted `<script>` tag would not run, but
`<img src=x onerror=...>` would.

**The rate card failing does not break the page.** Existing orders still render
from storage; only adding a new one is disabled, with a message saying why.

**Storage is a copy, not the source.** Corrupt it by hand in the Application
panel and the page still loads.

## Checking it works

There are no automated tests. Drive it by hand, and make sure each of these does
what it should:

- Submit the form empty — five messages, focus on the first bad field.
- A phone starting with 5, a pincode starting with 0, and 0 plates are rejected.
- A phone typed as `98765 43210` is accepted.
- Add two orders, mark one delivered, filter and search.
- Reload — the orders are still there.
- Set the rate card URL to something missing, to an HTML file, and to a dead
  port. Each gives a different message, and the orders still render.
- Replace the stored value with `{not an array` in devtools and reload.
