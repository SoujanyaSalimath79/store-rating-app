import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DataTable from '../components/DataTable';
import Field from '../components/Field';
import useSort from '../components/useSort';
import { validate } from '../validation';

function Stats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setStats(r.data));
  }, []);
  if (!stats) return null;
  return (
    <div className="stat-row">
      <div className="stat"><b>{stats.totalUsers}</b><span>Total users</span></div>
      <div className="stat"><b>{stats.totalStores}</b><span>Total stores</span></div>
      <div className="stat"><b>{stats.totalRatings}</b><span>Total ratings</span></div>
    </div>
  );
}

function AddUserForm({ onCreated }) {
  const empty = { name: '', email: '', address: '', password: '', role: 'USER' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const found = validate({ name: form.name, email: form.email, address: form.address, password: form.password });
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await api.post('/admin/users', form);
      setForm(empty);
      setMsg({ type: 'success', text: 'User created' });
      onCreated();
    } catch (err) {
      setMsg({ type: 'alert', text: errorMessage(err) });
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h3>Add user</h3>
      {msg.text && <div className={msg.type}>{msg.text}</div>}
      <div className="grid">
        <Field label="Name" error={errors.name}><input value={form.name} onChange={set('name')} /></Field>
        <Field label="Email" error={errors.email}><input value={form.email} onChange={set('email')} /></Field>
        <Field label="Password" error={errors.password}><input type="password" value={form.password} onChange={set('password')} /></Field>
        <Field label="Role">
          <select value={form.role} onChange={set('role')}>
            <option value="USER">Normal user</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Store owner</option>
          </select>
        </Field>
      </div>
      <Field label="Address" error={errors.address}><textarea rows={2} value={form.address} onChange={set('address')} /></Field>
      <button>Add user</button>
    </form>
  );
}

function AddStoreForm({ owners, onCreated }) {
  const empty = { name: '', email: '', address: '', ownerId: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const found = validate({ name: form.name, email: form.email, address: form.address });
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      const body = { name: form.name, email: form.email, address: form.address };
      if (form.ownerId) body.ownerId = Number(form.ownerId);
      await api.post('/admin/stores', body);
      setForm(empty);
      setMsg({ type: 'success', text: 'Store created' });
      onCreated();
    } catch (err) {
      setMsg({ type: 'alert', text: errorMessage(err) });
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h3>Add store</h3>
      {msg.text && <div className={msg.type}>{msg.text}</div>}
      <div className="grid">
        <Field label="Store name" error={errors.name}><input value={form.name} onChange={set('name')} /></Field>
        <Field label="Store email" error={errors.email}><input value={form.email} onChange={set('email')} /></Field>
        <Field label="Owner (optional)">
          <select value={form.ownerId} onChange={set('ownerId')}>
            <option value="">No owner</option>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Address" error={errors.address}><textarea rows={2} value={form.address} onChange={set('address')} /></Field>
      <button>Add store</button>
    </form>
  );
}

function UsersSection({ refreshKey }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [detail, setDetail] = useState(null);
  const { sortBy, order, onSort } = useSort('name');

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/admin/users', { params: { ...filters, sortBy, order } }).then((r) => setRows(r.data));
    }, 300);
    return () => clearTimeout(t);
  }, [filters, sortBy, order, refreshKey]);

  const showDetail = async (row) => {
    const { data } = await api.get(`/admin/users/${row.id}`);
    setDetail(data);
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
  ];
  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="card">
      <h3>Users</h3>
      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={f('name')} />
        <input placeholder="Filter by email" value={filters.email} onChange={f('email')} />
        <input placeholder="Filter by address" value={filters.address} onChange={f('address')} />
        <select value={filters.role} onChange={f('role')}>
          <option value="">All roles</option>
          <option value="USER">Normal user</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Store owner</option>
        </select>
      </div>
      <DataTable columns={columns} rows={rows} sortBy={sortBy} order={order} onSort={onSort} onRowClick={showDetail} />
      {detail && (
        <div className="detail">
          <button className="btn-secondary" onClick={() => setDetail(null)}>Close</button>
          <h4>{detail.name}</h4>
          <p>Email: {detail.email}</p>
          <p>Address: {detail.address}</p>
          <p>Role: {detail.role}</p>
          {detail.role === 'OWNER' && <p>Store rating: {detail.rating ?? 'No ratings yet'}</p>}
        </div>
      )}
    </div>
  );
}

function StoresSection({ refreshKey }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const { sortBy, order, onSort } = useSort('name');

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/admin/stores', { params: { ...filters, sortBy, order } }).then((r) => setRows(r.data));
    }, 300);
    return () => clearTimeout(t);
  }, [filters, sortBy, order, refreshKey]);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => r.rating ?? 'No ratings yet' },
  ];
  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="card">
      <h3>Stores</h3>
      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={f('name')} />
        <input placeholder="Filter by email" value={filters.email} onChange={f('email')} />
        <input placeholder="Filter by address" value={filters.address} onChange={f('address')} />
      </div>
      <DataTable columns={columns} rows={rows} sortBy={sortBy} order={order} onSort={onSort} />
    </div>
  );
}

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [owners, setOwners] = useState([]);
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'OWNER' } })
      .then((r) => setOwners(r.data))
      .catch((err) => console.error(errorMessage(err)));
  }, [refreshKey]);

  return (
    <div>
      <h2>Admin dashboard</h2>
      <Stats key={refreshKey} />
      <AddUserForm onCreated={refresh} />
      <AddStoreForm owners={owners} onCreated={refresh} />
      <UsersSection refreshKey={refreshKey} />
      <StoresSection refreshKey={refreshKey} />
    </div>
  );
}
