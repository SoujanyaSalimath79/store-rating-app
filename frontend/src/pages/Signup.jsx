import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Field from '../components/Field';
import { validate } from '../validation';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await api.post('/auth/signup', form);
      navigate('/login');
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <form className="card narrow" onSubmit={submit} noValidate>
      <h2>Create account</h2>
      {serverError && <div className="alert">{serverError}</div>}
      <Field label="Name (20-60 characters)" error={errors.name}>
        <input value={form.name} onChange={set('name')} />
      </Field>
      <Field label="Email" error={errors.email}>
        <input type="email" value={form.email} onChange={set('email')} />
      </Field>
      <Field label="Address (max 400 characters)" error={errors.address}>
        <textarea rows={3} value={form.address} onChange={set('address')} />
      </Field>
      <Field label="Password" error={errors.password}>
        <input type="password" value={form.password} onChange={set('password')} />
      </Field>
      <button>Sign up</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
