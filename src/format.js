// Money is counted in paise everywhere and converted only for display,
// because 80.10 * 3 is 240.29999999999998 and a bill cannot be approximate.

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export function formatPaise(paise) {
  return rupees.format(paise / 100);
}

export function formatDate(isoDate) {
  // isoDate is a calendar day like '2026-09-28', not an instant.
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
}

export function todayIso() {
  // Built from local parts. toISOString() would give the previous day in IST.
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
