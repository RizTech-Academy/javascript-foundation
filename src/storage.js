// localStorage can throw: the quota can be full, and some privacy settings
// make even reading fail. The page must work when it does.

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function load(key, fallback) {
  try {
    const text = localStorage.getItem(key);
    if (text === null) return fallback;

    const parsed = JSON.parse(text);
    // Valid JSON of the wrong shape breaks everything downstream just as
    // thoroughly as corrupt text, so check the shape too.
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
