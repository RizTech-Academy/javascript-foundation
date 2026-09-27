import { load, save } from './storage.js';

const STORAGE_KEY = 'tiffin-orders';

// A module is evaluated once, so everything importing this talks to the
// same orders. The array is the truth; the page is a picture of it.
let orders = load(STORAGE_KEY, []);
let meals = [];
let filter = 'all';
let query = '';

const listeners = new Set();

function changed() {
  save(STORAGE_KEY, orders);
  for (const listener of listeners) listener();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Hand back a copy. Returning the array itself would let a caller push to it.
export function getOrders() {
  return [...orders];
}

export function getMeals() {
  return [...meals];
}

export function getFilter() {
  return filter;
}

export function setMeals(next) {
  meals = next;
  changed();
}

export function setFilter(next) {
  filter = next;
  changed();
}

export function setQuery(next) {
  query = next;
  changed();
}

export function visibleOrders() {
  const q = query.trim().toLowerCase();

  return orders.filter((order) => {
    if (filter === 'pending' && order.delivered) return false;
    if (filter === 'delivered' && !order.delivered) return false;
    if (q === '') return true;

    return (
      order.customer.toLowerCase().includes(q) ||
      order.pincode.includes(q) ||
      order.phone.includes(q)
    );
  });
}

export function addOrder(order) {
  orders = [...orders, { ...order, id: crypto.randomUUID(), delivered: false }];
  changed();
}

export function toggleDelivered(id) {
  orders = orders.map((order) =>
    order.id === id ? { ...order, delivered: !order.delivered } : order,
  );
  changed();
}

export function removeOrder(id) {
  orders = orders.filter((order) => order.id !== id);
  changed();
}

export function mealById(id) {
  return meals.find((meal) => meal.id === id) ?? null;
}

export function orderTotalPaise(order) {
  const meal = mealById(order.meal);
  // ?? rather than ||, so a genuinely free meal at 0 paise is not replaced.
  return (meal?.paise ?? 0) * order.plates;
}

export function totals() {
  const all = orders.reduce((sum, order) => sum + orderTotalPaise(order), 0);
  const pending = orders.filter((order) => !order.delivered).length;

  return { revenuePaise: all, pending, count: orders.length };
}
