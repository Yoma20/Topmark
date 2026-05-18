import { useState } from 'react';
import './orders.scss';
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import { startConversation } from "../../api/messaging";

const FILTERS = ["all", "pending", "in_progress", "submitted", "completed", "archived"];

const STATUS_LABELS = {
  all:         "All",
  pending:     "Pending",
  in_progress: "In Progress",
  submitted:   "Submitted",
  completed:   "Completed",
  archived:    "Archived",
};

// Matches Order.PAYMENT_STATUS_CHOICES exactly
const PAYMENT_LABELS = {
  unpaid:   "Unpaid",
  held:     "Held",
  released: "Paid Out",
  refunded: "Refunded",
  pending:  "Pending",   // legacy / bank transfer
};

const Orders = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const { isLoading, error, data } = useQuery({
    queryKey: ['orders'],
    queryFn: () =>
      newRequest.get(`/gigs/orders/`).then((res) => res.data?.results ?? res.data),
  });

  const filtered =
    !data ? [] : filter === "all" ? data : data.filter((o) => o.status === filter);

  const handleContact = async (order) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isStudent = currentUser?.user_type === 'student';
    const recipientUsername = isStudent ? order.expert_username : order.student_username;
    try {
      await startConversation(recipientUsername);
      navigate('/messages');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="orders">
      <div className="orders__container">
        <div className="orders__header">
        <button className="orders__back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
          <h1>My Orders</h1>
        </div>

        {/* ── Filter tabs ── */}
        <div className="orders__filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`orders__filter-btn ${filter === f ? 'orders__filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {/* ── Content card ── */}
        <div className="orders__card">
          {isLoading ? (
            <div className="orders__feedback">Loading…</div>
          ) : error ? (
            <div className="orders__feedback orders__feedback--error">
              Something went wrong. Please try again.
            </div>
          ) : filtered.length === 0 ? (
            <div className="orders__feedback">No orders in this category.</div>
          ) : (
            <table className="orders__table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Gig</th>
                  <th>Package</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <img
                        src={order.gig_cover || '/images/noavatar.jpeg'}
                        alt=""
                        className="orders__cover"
                      />
                    </td>
                    <td>{order.gig_title}</td>
                    <td>{order.package?.tier ?? '—'}</td>
                    <td className="orders__price">${order.total_price}</td>
                    <td>
                      <span className={`orders__badge orders__badge--${order.status}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`orders__badge orders__badge--pay-${order.payment_status}`}>
                        {PAYMENT_LABELS[order.payment_status] || order.payment_status}
                      </span>
                    </td>
                    <td>
                      <img
                        className="orders__msg-icon"
                        src="/images/message.png"
                        alt="Contact"
                        onClick={() => handleContact(order)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;