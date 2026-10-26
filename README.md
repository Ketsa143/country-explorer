# Country Explorer

Mini app for the workshop **Debug Squad: DOM, Async Code & Fetch** (Ingeniería Web I · Guía 6, Universidad Manuela Beltrán).

Author: Keppler Sánchez

## What it does

- A form with one text field for the country name (required, at least 3 letters).
- Real-time validation: shows **"Type at least 3 letters"** while the field is invalid and **"Looks good"** when it is valid.
- On submit, an `async` function uses `await fetch()`, checks `response.ok` and converts the answer with `await response.json()`.
- Renders the country name, capital, population and flag in the DOM.
- If the request fails, `try/catch` shows a clear error message on the page ("Country not found" or "Could not load the data. Please try again.").

## How the async flow works

1. **First**, the user submits the form and `showCountry()` sends a request with `fetch()`.
2. **Then**, `await` pauses the function until the response arrives.
3. If `response.ok` is false (for example, a 404), the code throws an error and the `catch` block shows a message.
4. **Finally**, the JSON data is rendered in the DOM.

## How to run it

Open `index.html` in any browser. No installation is needed.

## API

The workshop suggested REST Countries v3.1, but that version was deprecated in 2026 and the new v5 requires an API key. This app uses two free public APIs without a key:

1. **API Countries** (main): `https://www.apicountries.com/name/{name}`
2. **CountriesNow** (backup): `https://countriesnow.space/api/v0.1/countries/...` — three requests that run at the same time with `Promise.all`.

If the main API fails, the app tries the backup API before it shows an error.

## References

- Mozilla Developer Network. (2026). *Using the Fetch API*. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- javascript.info. (2026). *Promises, async/await*. https://javascript.info/async
