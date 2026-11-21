import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api';
import { HOME_BY_ROLE, useAuth } from '../AuthContext';
import Field from '../components/Field';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(HOME_BY_ROLE[user.role]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Log in</h2>
      {error && <div className="alert">{error}</div>}
      <Field label="Email">
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </Field>
      <Field label="Password">
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      </Field>
      <button disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      <p className="muted">New here? <Link to="/signup">Create an account</Link></p>
    </form>
  );
}
