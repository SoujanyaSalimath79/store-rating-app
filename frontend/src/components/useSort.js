import { useState } from 'react';

// Clicking the same column flips direction; a new column starts ascending
export default function useSort(initialKey = 'name') {
  const [sortBy, setSortBy] = useState(initialKey);
  const [order, setOrder] = useState('ASC');

  const onSort = (key) => {
    if (key === sortBy) setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else {
      setSortBy(key);
      setOrder('ASC');
    }
  };
  return { sortBy, order, onSort };
}
