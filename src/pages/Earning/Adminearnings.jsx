import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import newRequest from '../../utils/newRequest';
import './Adminearnings.scss';

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const weekStart = fmt(new Date(today.setDate(today.getDate() - today.getDay() + 1)));
const weekEnd   = fmt(new Date(today.setDate(today.getDate() - today.getDay() + 7)));

const STATUS_COLOR = {
  paid:    'paid',
  pending: 'pending',
  unpaid:  'unpaid',
};

const AdminEarnings = () => {
  const [from, setFrom] = useState(weekStart);
  const [to,   setTo]   = useState(weekEnd);
  const [search, setSearch] = useState('');
  const [enabled, setEnabled] = useState(true);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-earnings', from, to],
    queryFn: () =>
      newRequest.get(`/gigs/earnings/?from=${from}&to=${to}`).then(r => r.data),
    enabled,
  });

  const experts = (data?.experts ?? []).filter(e =>
    e.username.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalGross  = experts.reduce((s, e) => s + e.total, 0);
  const totalOrders = experts.reduce((s, e) => s + e.orders, 0);
  const platformFee = totalGross * 0.10;
  const totalOwed   = totalGross - platformFee;

  const handleApply = () => {
    setEnabled(true);
    refetch();
  };

  return (
    <div className="ae">

      {/* ── Sidebar ── */}
      <aside className="ae__sidebar">
        <div className="ae__brand">
          <span className="ae__brand-top">Top</span>
          <span className="ae__brand-mark">Mark</span>
        </div>
        <nav className="ae__nav">
          <a href="/admin" className="ae__nav-link">📊 Overview</a>
          <a href="/admin/earnings" className="ae__nav-link ae__nav-link--active">💰 Earnings</a>
          <a href="/admin/orders" className="ae__nav-link">📦 Orders</a>
          <a href="/admin/users" className="ae__nav-link">👥 Users</a>
        </nav>
        <div className="ae__sidebar-footer">
          <a href="/" className="ae__nav-link">← Back to Site</a>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ae__main">

        <header className="ae__header">
          <div>
            <h1 className="ae__title">Expert Earnings</h1>
            <p className="ae__subtitle">Weekly payout calculator</p>
          </div>
        </header>

        {/* ── Filters ── */}
        <div className="ae__filters">
          <div className="ae__filter-group">
            <label>From</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
          </div>
          <div className="ae__filter-group">
            <label>To</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
          </div>
          <button className="ae__apply-btn" onClick={handleApply}>
            Calculate
          </button>
          <div className="ae__search-wrap">
            <input
              type="text"
              placeholder="Search expert…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ae__search"
            />
          </div>
        </div>

        {/* ── Summary cards ── */}
        {data && (
          <div className="ae__summary">
            <div className="ae__summary-card">
              <span className="ae__summary-label">Period</span>
              <span className="ae__summary-value ae__summary-value--sm">
                {data.period.from} → {data.period.to}
              </span>
            </div>
            <div className="ae__summary-card">
              <span className="ae__summary-label">Total Orders</span>
              <span className="ae__summary-value">{totalOrders}</span>
            </div>
            <div className="ae__summary-card">
              <span className="ae__summary-label">Gross Revenue</span>
              <span className="ae__summary-value">${totalGross.toFixed(2)}</span>
            </div>
            <div className="ae__summary-card ae__summary-card--fee">
              <span className="ae__summary-label">Platform Fee (10%)</span>
              <span className="ae__summary-value">−${platformFee.toFixed(2)}</span>
            </div>
            <div className="ae__summary-card ae__summary-card--owed">
              <span className="ae__summary-label">Total to Pay Out</span>
              <span className="ae__summary-value ae__summary-value--big">${totalOwed.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="ae__table-wrap">
          {isLoading && (
            <div className="ae__feedback">
              <div className="ae__spinner" />
              <span>Calculating…</span>
            </div>
          )}

          {isError && (
            <div className="ae__feedback ae__feedback--error">
              Failed to load earnings. Check your connection and try again.
            </div>
          )}

          {data && experts.length === 0 && (
            <div className="ae__feedback">
              No completed orders found for this period.
            </div>
          )}

          {data && experts.length > 0 && (
            <table className="ae__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Expert</th>
                  <th>Email</th>
                  <th className="ae__th--right">Orders</th>
                  <th className="ae__th--right">Gross</th>
                  <th className="ae__th--right">Fee (10%)</th>
                  <th className="ae__th--right">Owed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {experts.map((e, i) => {
                  const fee  = e.total * 0.10;
                  const owed = e.total - fee;
                  return (
                    <tr key={i} className="ae__tr">
                      <td className="ae__td-num">{i + 1}</td>
                      <td>
                        <div className="ae__expert">
                          <div className="ae__avatar">
                            {e.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="ae__username">{e.username}</span>
                        </div>
                      </td>
                      <td className="ae__email">{e.email}</td>
                      <td className="ae__td--right">{e.orders}</td>
                      <td className="ae__td--right">${e.total.toFixed(2)}</td>
                      <td className="ae__td--right ae__td--fee">−${fee.toFixed(2)}</td>
                      <td className="ae__td--right ae__td--owed">${owed.toFixed(2)}</td>
                      <td>
                        <span className={`ae__badge ae__badge--${e.paid ? 'paid' : 'pending'}`}>
                          {e.paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="ae__tfoot-row">
                  <td colSpan={4} className="ae__tfoot-label">Total</td>
                  <td className="ae__td--right ae__tfoot-val">${totalGross.toFixed(2)}</td>
                  <td className="ae__td--right ae__tfoot-val">−${platformFee.toFixed(2)}</td>
                  <td className="ae__td--right ae__tfoot-val ae__tfoot-val--owed">${totalOwed.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

      </main>
    </div>
  );
};

export default AdminEarnings;