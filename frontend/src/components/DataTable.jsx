// Table with clickable, sortable headers. Sorting itself happens on the server.
export default function DataTable({ columns, rows, sortBy, order, onSort, onRowClick, empty = 'No records found' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={c.sortable ? 'sortable' : ''}
                onClick={() => c.sortable && onSort(c.key)}
              >
                {c.label}
                {c.sortable && sortBy === c.key && (order === 'ASC' ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="muted center">{empty}</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.id ?? i} onClick={() => onRowClick && onRowClick(row)} className={onRowClick ? 'clickable' : ''}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
