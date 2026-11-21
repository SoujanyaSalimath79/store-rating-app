import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DataTable from '../components/DataTable';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stores/owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p>Loading...</p>;

  const columns = [
    { key: 'name', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'value', label: 'Rating' },
    { key: 'ratedAt', label: 'Date', render: (r) => new Date(r.ratedAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="card">
        <h2>{data.store.name}</h2>
        <p className="muted">{data.store.address}</p>
        <div className="stat-row">
          <div className="stat"><b>{data.averageRating ?? '-'}</b><span>Average rating</span></div>
          <div className="stat"><b>{data.totalRatings}</b><span>Total ratings</span></div>
        </div>
      </div>
      <div className="card">
        <h3>Users who rated your store</h3>
        <DataTable columns={columns} rows={data.raters.map((r) => ({ ...r, id: r.userId }))} />
      </div>
    </div>
  );
}
