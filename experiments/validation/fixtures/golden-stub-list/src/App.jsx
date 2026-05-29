import { useCallback, useEffect, useRef, useState } from 'react';

function buildQuery(search, category) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (category && category !== 'all') params.set('category', category);
  const qs = params.toString();
  return qs ? `/api/items?${qs}` : '/api/items';
}

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const requestSeq = useRef(0);

  const loadItems = useCallback(async (searchValue, categoryValue) => {
    const seq = ++requestSeq.current;
    setStatus('loading');
    setError('');

    try {
      const res = await fetch(buildQuery(searchValue, categoryValue));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (seq !== requestSeq.current) return;
      setItems(Array.isArray(data.items) ? data.items : []);
      setStatus('ready');
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setItems([]);
      setStatus('error');
      setError(err.message || 'Request failed');
    }
  }, []);

  useEffect(() => {
    loadItems(search, category);
  }, [search, category, loadItems]);

  const visible = items.filter((item) => {
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.includes(search);
    const matchCategory =
      category === 'all' || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="app" data-testid="list-page">
      <h1>Data List</h1>
      <div className="toolbar">
        <input
          data-testid="search-input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          data-testid="category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
        </select>
      </div>

      {status === 'loading' && (
        <div className="status-banner loading" data-testid="loading-state">
          Loading items...
        </div>
      )}

      {status === 'error' && (
        <div className="status-banner error" data-testid="error-state">
          Failed to load: {error}
          <button
            type="button"
            className="retry-btn"
            data-testid="retry-button"
            onClick={() => loadItems(search, category)}
          >
            Retry
          </button>
        </div>
      )}

      {status === 'ready' && visible.length === 0 && (
        <div className="status-banner empty" data-testid="empty-state">
          No items match your filters.
        </div>
      )}

      {status === 'ready' && visible.length > 0 && (
        <table data-testid="items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id} data-testid="item-row">
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
