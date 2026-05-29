import { useEffect, useState } from 'react';

const DEFAULT_KPIS = [
  { id: 'users', label: 'Active Users', value: '1,284' },
  { id: 'revenue', label: 'Revenue', value: '$42.1k' },
  { id: 'orders', label: 'Orders', value: '318' },
  { id: 'uptime', label: 'Uptime', value: '99.9%' },
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function App() {
  const [kpis, setKpis] = useState([]);
  const [cards, setCards] = useState([]);
  const [dense, setDense] = useState(false);
  const [longText, setLongText] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDense(params.get('dense') === '1');
    setLongText(params.get('longText') === '1');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const kpiData = await fetchJson('/api/kpis');
        if (!cancelled) setKpis(kpiData.kpis ?? DEFAULT_KPIS);
      } catch {
        if (!cancelled) setKpis(DEFAULT_KPIS);
      }

      try {
        const cardData = await fetchJson('/api/cards');
        if (!cancelled) setCards(cardData.cards ?? []);
      } catch {
        if (!cancelled) setCards([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayKpis = kpis.map((kpi) => ({
    ...kpi,
    label: longText
      ? `${kpi.label}-VERY-LONG-IDENTIFIER-THAT-SHOULD-WRAP-OR-TRUNCATE-${kpi.id}`
      : kpi.label,
  }));

  return (
    <div className="dashboard" data-testid="dashboard-shell">
      <nav className="dashboard-nav" data-testid="dashboard-nav">
        <strong>Admin</strong>
        <a href="#overview">Overview</a>
        <a href="#records">Records</a>
        <a href="#settings">Settings</a>
      </nav>

      <main className="dashboard-main">
        <h1>Dashboard</h1>

        <section
          className={`kpi-grid${dense ? ' dense' : ''}`}
          data-testid="kpi-grid"
        >
          {displayKpis.map((kpi) => (
            <article
              key={kpi.id}
              className={`kpi-card${kpi.error ? ' error' : ''}`}
              data-testid={`kpi-card-${kpi.id}`}
            >
              <div
                className={`kpi-label${longText ? ' wrap' : ''}`}
                data-testid="kpi-label"
              >
                {kpi.label}
              </div>
              <div className="kpi-value" data-testid="kpi-value">
                {kpi.error ? '—' : kpi.value}
              </div>
              {kpi.error && (
                <div data-testid="kpi-error">Failed to load metric</div>
              )}
            </article>
          ))}
        </section>

        <section className="actions" data-testid="management-actions">
          <button type="button">Export</button>
          <button type="button">Refresh</button>
          <button type="button">Manage Records</button>
        </section>

        {cards.length > 0 && (
          <section data-testid="detail-cards">
            {cards.map((card) => (
              <div key={card.id}>{card.title}</div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
