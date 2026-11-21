import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DataTable from '../components/DataTable';
import useSort from '../components/useSort';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const { sortBy, order, onSort } = useSort('name');

  const load = async () => {
    try {
      const { data } = await api.get('/stores', { params: { search, sortBy, order } });
      setStores(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  // Re-fetch when sorting changes; search is debounced
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, sortBy, order]);

  const rate = async (storeId, value) => {
    try {
      await api.put(`/stores/${storeId}/rating`, { value: Number(value) });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const columns = [
    { key: 'name', label: 'Store', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Overall rating', sortable: true, render: (r) => (r.rating ?? 'No ratings yet') },
    { key: 'userRating', label: 'Your rating', render: (r) => r.userRating ?? 'Not rated' },
    {
      key: 'action',
      label: 'Rate (1-5)',
      render: (r) => (
        <select value={r.userRating ?? ''} onChange={(e) => rate(r.id, e.target.value)}>
          <option value="" disabled>{r.userRating ? 'Modify' : 'Select'}</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      ),
    },
  ];

  return (
    <div className="card">
      <h2>Stores</h2>
      {error && <div className="alert">{error}</div>}
      <input
        className="search"
        placeholder="Search by name or address"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <DataTable columns={columns} rows={stores} sortBy={sortBy} order={order} onSort={onSort} />
    </div>
  );
}
