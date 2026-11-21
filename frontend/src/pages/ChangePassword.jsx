import { useState } from 'react';
import api, { errorMessage } from '../api';
import Field from '../components/Field';
import { validate } from '../validation';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const found = validate({ password: form.newPassword });
    if (found.password) return setError(found.password);
    try {
      await api.patch('/auth/password', form);
      setSuccess('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Change password</h2>
      {error && <div className="alert">{error}</div>}
      {success && <div className="success">{success}</div>}
      <Field label="Current password">
        <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
      </Field>
      <Field label="New password">
        <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
      </Field>
      <button>Update password</button>
    </form>
  );
}
