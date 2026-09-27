import { loadRates } from './api.js';
import { messageFor } from './errors.js';
import { render, renderMealOptions } from './render.js';
import {
  addOrder,
  getMeals,
  removeOrder,
  setFilter,
  setMeals,
  setQuery,
  subscribe,
  toggleDelivered,
} from './state.js';
import { validateOrder } from './validate.js';

const form = document.querySelector('#order-form');
const ratesStatus = document.querySelector('#rates-status');
const listEl = document.querySelector('#orders');
const filtersEl = document.querySelector('#filters');
const searchEl = document.querySelector('#search');

const FIELDS = ['customer', 'phone', 'pincode', 'plates', 'meal'];

function clearErrors() {
  for (const field of FIELDS) {
    document.querySelector(`#${field}-error`).textContent = '';
    document.querySelector(`#${field}`).removeAttribute('aria-invalid');
  }
}

function showErrors(errors) {
  for (const [field, message] of Object.entries(errors)) {
    document.querySelector(`#${field}-error`).textContent = message;
    document.querySelector(`#${field}`).setAttribute('aria-invalid', 'true');
  }

  const first = FIELDS.find((field) => field in errors);
  if (first) document.querySelector(`#${first}`).focus();
}

subscribe(render);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();

  const raw = Object.fromEntries(new FormData(form));
  const mealIds = getMeals().map((meal) => meal.id);

  // Every value from a form is a string. Validation converts at the boundary.
  const result = validateOrder(
    {
      customer: raw.customer ?? '',
      phone: raw.phone ?? '',
      pincode: raw.pincode ?? '',
      plates: raw.plates ?? '',
      meal: raw.meal ?? '',
    },
    mealIds,
  );

  if (!result.ok) {
    showErrors(result.errors);
    return;
  }

  addOrder(result.value);
  form.reset();
  document.querySelector('#customer').focus();
});

form.addEventListener('input', (event) => {
  const field = event.target.id;
  if (FIELDS.includes(field)) {
    document.querySelector(`#${field}-error`).textContent = '';
    document.querySelector(`#${field}`).removeAttribute('aria-invalid');
  }
});

// One listener for the whole list, so rows added later work too.
listEl.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;

  const row = control.closest('.order');
  if (!row) return;

  if (control.dataset.action === 'toggle') toggleDelivered(row.dataset.id);
  if (control.dataset.action === 'remove') removeOrder(row.dataset.id);
});

filtersEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  setFilter(button.dataset.filter);
});

searchEl.addEventListener('input', () => {
  setQuery(searchEl.value);
});

async function start(url) {
  ratesStatus.textContent = 'Loading today’s rates…';
  form.querySelector('button[type="submit"]').disabled = true;

  try {
    setMeals(await loadRates(url));
    renderMealOptions();
    ratesStatus.textContent = '';
    form.querySelector('button[type="submit"]').disabled = false;
  } catch (error) {
    console.error(error);
    ratesStatus.textContent = messageFor(error);
    // Orders still render from storage; only new ones are blocked.
  }

  render();
}

// Exposed so the failure paths can be exercised from the console.
window.__start = start;

start().catch(console.error);
