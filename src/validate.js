// One named pattern per field, and none of them carries a /g flag —
// a /g regex used with .test() alternates true and false on the same string.

const PINCODE = /^[1-9]\d{5}$/; // six digits, no leading zero
const PHONE = /^[6-9]\d{9}$/; // ten digits, starting 6 to 9

export function validateOrder(raw, mealIds) {
  const errors = {};

  const customer = raw.customer.trim();
  if (customer === '') {
    errors.customer = 'Please enter a name.';
  } else if (customer.length > 60) {
    errors.customer = 'That name is too long.';
  }

  const phone = raw.phone.replace(/\s|-/g, '');
  if (!PHONE.test(phone)) {
    errors.phone = 'Ten digits, starting 6 to 9.';
  }

  const pincode = raw.pincode.trim();
  if (!PINCODE.test(pincode)) {
    errors.pincode = 'Six digits, not starting with zero.';
  }

  // A number input hands back '' when the user types letters, and
  // Number('') is 0 — so check for empty before converting.
  const platesText = raw.plates.trim();
  const plates = Number(platesText);
  if (platesText === '' || Number.isNaN(plates)) {
    errors.plates = 'Enter how many plates.';
  } else if (!Number.isInteger(plates) || plates < 1 || plates > 50) {
    errors.plates = 'Between 1 and 50 whole plates.';
  }

  if (!mealIds.includes(raw.meal)) {
    errors.meal = 'Choose a meal.';
  }

  const ok = Object.keys(errors).length === 0;

  return {
    ok,
    errors,
    value: ok ? { customer, phone, pincode, plates, meal: raw.meal } : null,
  };
}
