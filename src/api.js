import { HttpError, NetworkError, TimeoutError } from './errors.js';

export async function fetchJson(url, { timeout = 5000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TimeoutError('The server took too long.');
    }
    throw new NetworkError('Could not reach the server.');
  } finally {
    // Always clear it, or a fast response leaves a timer that would
    // abort a later request.
    clearTimeout(timer);
  }

  // fetch does not reject on 404 or 500. Check before reading the body,
  // or an HTML error page gives "Unexpected token '<'" instead.
  if (!response.ok) {
    throw new HttpError(response.status, `Request failed with ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    throw new HttpError(response.status, 'The server sent something that was not JSON.');
  }
}

export async function loadRates(url = 'data/rates.json') {
  const data = await fetchJson(url);

  const meals = Array.isArray(data?.meals) ? data.meals : [];
  if (meals.length === 0) {
    throw new HttpError(200, 'The rate card has no meals in it.');
  }

  return meals;
}
