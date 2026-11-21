// Mirrors the backend rules so users get instant feedback
export const rules = {
  name: (v) => (v.length < 20 || v.length > 60 ? 'Name must be 20-60 characters' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email'),
  address: (v) => (!v ? 'Address is required' : v.length > 400 ? 'Address must be at most 400 characters' : ''),
  password: (v) =>
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(v)
      ? ''
      : 'Password: 8-16 chars, one uppercase letter and one special character',
};

// fields: { name: 'value', ... } -> returns { name: 'error' } for the failing ones
export function validate(fields) {
  const errors = {};
  for (const [key, value] of Object.entries(fields)) {
    const msg = rules[key] ? rules[key](value || '') : '';
    if (msg) errors[key] = msg;
  }
  return errors;
}
