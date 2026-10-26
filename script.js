// Country Explorer - DOM, async/await and Fetch
// Note: REST Countries v3.1 (the API suggested in the workshop) was deprecated in 2026,
// and its new v5 needs an API key. This app uses two free public APIs without a key:
//   1. API Countries (same data format as REST Countries v2)
//   2. CountriesNow (backup, used only if the first API fails)
const PRIMARY_API = "https://www.apicountries.com/name/";
const BACKUP_API = "https://countriesnow.space/api/v0.1/countries/";

// Select the DOM elements once
const form = document.querySelector("#country-form");
const input = document.querySelector("#country-input");
const button = document.querySelector("#search-btn");
const feedback = document.querySelector("#feedback");
const statusText = document.querySelector("#status");
const card = document.querySelector("#card");

// Custom error so we can show "Country not found" instead of a generic message
class NotFoundError extends Error {
  constructor() {
    super("Country not found");
    this.name = "NotFoundError";
  }
}

// Real-time validation: check the field every time the user types
function validateInput() {
  const value = input.value.trim();
  const isValid = value.length >= 3;

  input.classList.toggle("valid", isValid);
  input.classList.toggle("invalid", !isValid);
  feedback.className = isValid ? "valid" : "invalid";
  feedback.textContent = isValid ? "Looks good" : "Type at least 3 letters";
  button.disabled = !isValid;

  return isValid;
}

input.addEventListener("input", validateInput);

// Helper: send a request, check response.ok and convert the JSON
async function getJson(url) {
  const response = await fetch(url);

  // fetch() does not reject on 404 or 500, so we check response.ok ourselves
  if (response.status === 404) throw new NotFoundError();
  if (!response.ok) throw new Error("Status " + response.status);

  return await response.json();
}

// Source 1: API Countries -> returns an array of countries
async function getFromPrimary(name) {
  const data = await getJson(PRIMARY_API + encodeURIComponent(name));
  if (!Array.isArray(data) || data.length === 0) throw new NotFoundError();

  const country = data[0];
  return {
    name: country.name,
    capital: country.capital || "No capital",
    population: country.population,
    flag: (country.flags && (country.flags.png || country.flags.svg)) || country.flag
  };
}

// Source 2: CountriesNow -> three requests that run at the same time with Promise.all
async function getFromBackup(name) {
  const query = "?country=" + encodeURIComponent(name);
  const [capitalRes, populationRes, flagRes] = await Promise.all([
    getJson(BACKUP_API + "capital/q" + query),
    getJson(BACKUP_API + "population/q" + query),
    getJson(BACKUP_API + "flag/images/q" + query)
  ]);

  if (capitalRes.error || !capitalRes.data) throw new NotFoundError();

  const counts = (populationRes.data && populationRes.data.populationCounts) || [];
  const latest = counts[counts.length - 1];

  return {
    name: capitalRes.data.name,
    capital: capitalRes.data.capital || "No capital",
    population: latest ? latest.value : null,
    flag: flagRes.data ? flagRes.data.flag : ""
  };
}

// Main async function: request the country data and render it in the DOM
async function showCountry(name) {
  statusText.className = "";
  statusText.textContent = "Loading...";
  card.hidden = true;

  try {
    let country;
    try {
      // First, try the main API
      country = await getFromPrimary(name);
    } catch (firstError) {
      // If it fails, try the backup API before showing an error
      console.warn("Primary API failed, trying backup:", firstError.message);
      country = await getFromBackup(name);
    }

    renderCountry(country);
    statusText.textContent = "";
  } catch (error) {
    // Error handling: show a clear message to the user
    statusText.className = "error";
    statusText.textContent = error instanceof NotFoundError
      ? "Country not found"
      : "Could not load the data. Please try again.";
    console.error(error);
  }
}

// Build the country card with safe DOM methods (no innerHTML with API data)
function renderCountry(country) {
  card.replaceChildren();

  if (country.flag) {
    const flag = document.createElement("img");
    flag.src = country.flag;
    flag.alt = "Flag of " + country.name;
    card.append(flag);
  }

  const info = document.createElement("div");
  info.className = "info";

  const title = document.createElement("h2");
  title.textContent = country.name;

  const capital = document.createElement("p");
  capital.textContent = "Capital: " + country.capital;

  const population = document.createElement("p");
  population.textContent = "Population: " +
    (country.population ? Number(country.population).toLocaleString("en-US") : "Not available");

  info.append(title, capital, population);
  card.append(info);
  card.hidden = false;
}

// On submit: stop the page reload, validate again and call the async function
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (validateInput()) {
    showCountry(input.value.trim());
  }
});
