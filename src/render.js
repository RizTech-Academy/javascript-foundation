import { formatPaise } from './format.js';
import {
  getFilter,
  getMeals,
  getOrders,
  mealById,
  orderTotalPaise,
  totals,
  visibleOrders,
} from './state.js';

const listEl = document.querySelector('#orders');
const statusEl = document.querySelector('#list-status');
const summaryEl = document.querySelector('#summary');
const mealSelect = document.querySelector('#meal');
const filtersEl = document.querySelector('#filters');

export function renderMealOptions() {
  mealSelect.textContent = '';

  for (const meal of getMeals()) {
    const option = document.createElement('option');
    option.value = meal.id;
    // textContent, not innerHTML — this came from the network.
    option.textContent = `${meal.name} — ${formatPaise(meal.paise)}`;
    mealSelect.append(option);
  }
}

function orderRow(order) {
  const item = document.createElement('li');
  item.className = 'order';
  item.dataset.id = order.id;
  if (order.delivered) item.classList.add('is-delivered');

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = order.delivered;
  toggle.dataset.action = 'toggle';
  toggle.id = `delivered-${order.id}`;

  const label = document.createElement('label');
  label.setAttribute('for', toggle.id);
  label.className = 'visually-hidden';
  label.textContent = `Mark ${order.customer} delivered`;

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = order.customer;

  const meal = mealById(order.meal);
  const detail = document.createElement('span');
  detail.className = 'detail';
  detail.textContent = [
    meal ? meal.name : 'Unknown meal',
    `${order.plates} plate${order.plates === 1 ? '' : 's'}`,
    order.pincode,
    formatPaise(orderTotalPaise(order)),
  ].join(' · ');

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.dataset.action = 'remove';
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove ${order.customer}'s order`);

  item.append(toggle, label, name, detail, remove);
  return item;
}

export function render() {
  listEl.textContent = '';

  const shown = visibleOrders();
  const all = getOrders();

  for (const order of shown) {
    listEl.append(orderRow(order));
  }

  // An empty list and an empty filter result are different things.
  if (all.length === 0) {
    statusEl.textContent = 'No orders yet. Add the first one above.';
  } else if (shown.length === 0) {
    statusEl.textContent = 'No orders match that search.';
  } else {
    statusEl.textContent = '';
  }

  const { revenuePaise, pending, count } = totals();
  summaryEl.textContent =
    count === 0
      ? ''
      : `${shown.length} of ${count} shown · ${pending} pending · ${formatPaise(revenuePaise)} total`;

  const active = getFilter();
  for (const button of filtersEl.querySelectorAll('[data-filter]')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === active));
  }
}
