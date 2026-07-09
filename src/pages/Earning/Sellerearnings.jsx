import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import newRequest from '../../utils/newRequest';
import './Sellerearnings.scss';
import { useNavigate } from 'react-router-dom';

const PERIODS = [
  { label: 'This Week',  value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time',   value: 'all' },
];

const STATUS_LABELS = {
  unpaid:    'Unpaid',
  held:      'Held',
  released:  'Paid Out',
  refunded:  'Refunded',
};

const SellerEarnings = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seller-earnings', period],
    queryFn: () =>
      newRequest.get(`/gigs/my-earnings/?period=${period}`).then(r => r.data),
  });

  const orders       = data?.orders ?? [];
  const summary      = data?.summary ?? {};
  const grossTotal   = summary.gross   ?? 0;
  const platformFee  = summary.fee     ?? 0;
  const netEarnings  = summary.net     ?? 0;
  const pendingPay   = summary.pending ?? 0;

  return (
    <div className="se">

      {/* ── Top bar ── */}
      <div className="se__topbar">
        <div className="se__topbar-left">
          <button className="se__back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <h1 className="se__title">My Earnings</h1>
          <p className="se__subtitle">Track your income and order payments</p>
        </div>
        <div className="se__periods">
          {PERIODS.map(p => (
            <button
              key={p.value}
              className={`se__period-btn ${period === p.value ? 'se__period-btn--active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="se__summary">
        <div className="se__stat se__stat--main">
          <span className="se__stat-label">Net Earnings</span>
          <span className="se__stat-value">${netEarnings.toFixed(2)}</span>
          <span className="se__stat-note">After 10% platform fee</span>
        </div>
        <div className="se__stat">
          <span className="se__stat-label">Gross Revenue</span>
          <span className="se__stat-value se__stat-value--sm">${grossTotal.toFixed(2)}</span>
        </div>
        <div className="se__stat">
          <span className="se__stat-label">Platform Fee</span>
          <span className="se__stat-value se__stat-value--sm se__stat-value--fee">
            −${platformFee.toFixed(2)}
          </span>
        </div>
        <div className="se__stat">
          <span className="se__stat-label">Awaiting Payment</span>
          <span className="se__stat-value se__stat-value--sm se__stat-value--pending">
            ${pendingPay.toFixed(2)}
          </span>
          <span className="se__stat-note">Orders pending confirmation</span>
        </div>
        <div className="se__stat">
          <span className="se__stat-label">Completed Orders</span>
          <span className="se__stat-value se__stat-value--sm">{summary.completed_orders ?? 0}</span>
        </div>
      </div>

      

      {/* ── Orders table ── */}
      <div className="se__section">
        <h2 className="se__section-title">Order Breakdown</h2>

        {isLoading && (
          <div className="se__feedback">
            <div className="se__spinner" />
            <span>Loading earnings…</span>
          </div>
        )}

        {isError && (
          <div className="se__feedback se__feedback--error">
            Failed to load earnings. Please try again.
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="se__feedback">
            No completed orders for this period.
          </div>
        )}

        {orders.length > 0 && (
          <div className="se__table-wrap">
            <table className="se__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Gig</th>
                  <th>Student</th>
                  <th>Completed</th>
                  <th className="se__th--right">Gross</th>
                  <th className="se__th--right">Fee</th>
                  <th className="se__th--right">You Earn</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const gross = parseFloat(order.total_price);
                  const fee   = gross * 0.10;
                  const net   = gross - fee;
                  return (
                    <tr key={order.id} className="se__tr">
                      <td className="se__td-id">#{order.id}</td>
                      <td className="se__td-gig">{order.gig_title ?? '—'}</td>
                      <td className="se__td-student">{order.student_username ?? '—'}</td>
                      <td className="se__td-date">
                        {order.updated_at
                          ? new Date(order.updated_at).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : '—'}
                      </td>
                      <td className="se__td--right">${gross.toFixed(2)}</td>
                      <td className="se__td--right se__td--fee">−${fee.toFixed(2)}</td>
                      <td className="se__td--right se__td--net">${net.toFixed(2)}</td>
                      <td>
                        <span className={`se__badge se__badge--${order.payment_status}`}>
                          {STATUS_LABELS[order.payment_status] ?? order.payment_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="se__tfoot-row">
                  <td colSpan={4} className="se__tfoot-label">Total</td>
                  <td className="se__td--right se__tfoot-val">${grossTotal.toFixed(2)}</td>
                  <td className="se__td--right se__tfoot-val se__tfoot-val--fee">
                    −${platformFee.toFixed(2)}
                  </td>
                  <td className="se__td--right se__tfoot-val se__tfoot-val--net">
                    ${netEarnings.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerEarnings;