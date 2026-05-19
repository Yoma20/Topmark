import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, submitWork } from "../api/gigs";
import { startConversation } from "../api/messages";
import "./Orders.scss";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status) {
  return (
    <span className={`orders__badge orders__badge--${status}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function paymentBadge(paymentStatus) {
  return (
    <span className={`orders__badge orders__badge--pay-${paymentStatus}`}>
      {paymentStatus}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(deadline, status) {
  if (!deadline || status === "completed" || status === "archived") return false;
  return new Date(deadline) < new Date();
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const EXPERT_TABS = [
  {
    key: "active",
    label: "Active",
    filter: (o) => ["pending", "in_progress", "submitted"].includes(o.status),
  },
  {
    key: "awaiting",
    label: "Awaiting Payout",
    filter: (o) => o.status === "completed" && o.payment_status === "held",
  },
  {
    key: "paid",
    label: "Paid Out",
    filter: (o) => o.status === "completed" && o.payment_status === "released",
  },
  {
    key: "all",
    label: "All",
    filter: () => true,
  },
];

const STUDENT_TABS = [
  { key: "all",       label: "All",       filter: () => true },
  { key: "active",    label: "Active",    filter: (o) => ["pending", "in_progress", "submitted"].includes(o.status) },
  { key: "completed", label: "Completed", filter: (o) => o.status === "completed" },
  { key: "archived",  label: "Archived",  filter: (o) => o.status === "archived" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isExpert = user?.user_type === "expert";

  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState(isExpert ? "active" : "all");
  const [submitting, setSubmitting] = useState(null); // order id being submitted

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const tabs = isExpert ? EXPERT_TABS : STUDENT_TABS;
  const currentFilter = tabs.find((t) => t.key === tab)?.filter ?? (() => true);
  const visible = orders.filter(currentFilter);

  // ── Contact — passes the correct user ID (not username) ──────────────────
  async function handleContact(order) {
    const recipientId = isExpert ? order.student_user_id : order.expert_user_id;
    if (!recipientId) return;
    try {
      const conv = await startConversation(recipientId);
      navigate(`/messages/${conv.id}`);
    } catch {
      alert("Could not open conversation. Please try again.");
    }
  }

  // ── Expert submits work ───────────────────────────────────────────────────
  async function handleSubmitWork(orderId) {
    if (!window.confirm("Mark this order as submitted? The student will be notified.")) return;
    setSubmitting(orderId);
    try {
      await submitWork(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "submitted" } : o))
      );
    } catch {
      alert("Failed to submit work. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  // ── Column config per role ────────────────────────────────────────────────
  // Expert active tab shows: gig, student, requirements, status, deadline, price, actions
  // Expert awaiting/paid tabs show: gig, student, status, payment, net, completed, actions
  // Student shows: gig, expert, status, payment, price, deadline, actions

  return (
    <div className="orders">
      <div className="orders__container">
        {/* Header */}
        <div className="orders__header">
          <h1>{isExpert ? "My Orders" : "My Orders"}</h1>
        </div>

        {/* Tabs */}
        <div className="orders__filters">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`orders__filter-btn${tab === t.key ? " orders__filter-btn--active" : ""}`}
            >
              {t.label}
              {" "}
              <span style={{ opacity: 0.65, fontWeight: 400 }}>
                ({orders.filter(t.filter).length})
              </span>
            </button>
          ))}
        </div>

        {/* Payout notice */}
        {isExpert && tab === "awaiting" && visible.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 16px",
              background: "#fff8e6",
              border: "1px solid #f5d78e",
              borderRadius: 10,
              fontSize: "0.8rem",
              color: "#7a5800",
              lineHeight: 1.5,
            }}
          >
            💳 <strong>Biweekly payouts:</strong> Admin processes manual bank transfers every two
            weeks. Your net amount is <strong>90%</strong> of the order total after the platform
            fee.
          </div>
        )}

        {/* Content */}
        <div className="orders__card">
          {loading ? (
            <div className="orders__feedback">Loading orders…</div>
          ) : error ? (
            <div className="orders__feedback orders__feedback--error">{error}</div>
          ) : visible.length === 0 ? (
            <div className="orders__feedback">No orders in this category yet.</div>
          ) : isExpert ? (
            <ExpertTable
              orders={visible}
              tab={tab}
              submitting={submitting}
              onContact={handleContact}
              onSubmitWork={handleSubmitWork}
              onView={(id) => navigate(`/orders/${id}`)}
            />
          ) : (
            <StudentTable
              orders={visible}
              onContact={handleContact}
              onView={(id) => navigate(`/orders/${id}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Expert table ─────────────────────────────────────────────────────────────

function ExpertTable({ orders, tab, submitting, onContact, onSubmitWork, onView }) {
  const showPayoutCols = tab === "awaiting" || tab === "paid";

  return (
    <table className="orders__table">
      <thead>
        <tr>
          <th style={{ width: 64 }}></th>
          <th>Gig</th>
          <th>Student</th>
          {!showPayoutCols && <th>Requirements</th>}
          <th>Status</th>
          <th>Payment</th>
          {showPayoutCols && <th>Net Payout</th>}
          <th>{showPayoutCols ? "Completed" : "Deadline"}</th>
          <th>Price</th>
          <th style={{ width: 120 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const overdue = isOverdue(order.deadline, order.status);
          const net = (parseFloat(order.total_price) * 0.9).toFixed(2);

          return (
            <tr key={order.id}>
              {/* Cover */}
              <td>
                {order.gig_cover ? (
                  <img
                    src={order.gig_cover}
                    alt=""
                    className="orders__cover"
                  />
                ) : (
                  <div
                    className="orders__cover"
                    style={{
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    📄
                  </div>
                )}
              </td>

              {/* Gig title */}
              <td>
                <span
                  style={{ cursor: "pointer", fontWeight: 500, color: "#111" }}
                  onClick={() => onView(order.id)}
                >
                  {order.gig_title ?? "—"}
                </span>
                <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: 2 }}>
                  #{order.id}
                </div>
              </td>

              {/* Student */}
              <td>{order.student_username}</td>

              {/* Requirements (active tab only) */}
              {!showPayoutCols && (
                <td>
                  {order.status === "pending" ? (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: order.requirements_submitted ? "#1a9e60" : "#d98b1a",
                      }}
                    >
                      {order.requirements_submitted ? "✓ Received" : "⏳ Awaiting"}
                    </span>
                  ) : (
                    <span style={{ color: "#bbb", fontSize: "0.75rem" }}>—</span>
                  )}
                </td>
              )}

              {/* Status */}
              <td>{statusBadge(order.status)}</td>

              {/* Payment */}
              <td>{paymentBadge(order.payment_status)}</td>

              {/* Net payout (payout tabs only) */}
              {showPayoutCols && (
                <td>
                  <span
                    style={{
                      fontWeight: 600,
                      color: order.payment_status === "released" ? "#1a9e60" : "#d98b1a",
                    }}
                  >
                    ${net}
                  </span>
                </td>
              )}

              {/* Date */}
              <td>
                {showPayoutCols ? (
                  <span style={{ fontSize: "0.82rem" }}>{formatDate(order.updated_at)}</span>
                ) : (
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: overdue ? "#d94f4f" : "inherit",
                      fontWeight: overdue ? 600 : 400,
                    }}
                  >
                    {overdue && "⚠ "}
                    {formatDate(order.deadline)}
                  </span>
                )}
              </td>

              {/* Price */}
              <td>
                <span className="orders__price">${order.total_price}</span>
              </td>

              {/* Actions */}
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Message */}
                  <MessageIcon onClick={() => onContact(order)} />

                  {/* View */}
                  <ActionBtn onClick={() => onView(order.id)}>View</ActionBtn>

                  {/* Submit work */}
                  {order.status === "in_progress" && (
                    <ActionBtn
                      onClick={() => onSubmitWork(order.id)}
                      disabled={submitting === order.id}
                      variant="green"
                    >
                      {submitting === order.id ? "…" : "Submit"}
                    </ActionBtn>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Student table ────────────────────────────────────────────────────────────

function StudentTable({ orders, onContact, onView }) {
  return (
    <table className="orders__table">
      <thead>
        <tr>
          <th style={{ width: 64 }}></th>
          <th>Gig</th>
          <th>Expert</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Deadline</th>
          <th>Price</th>
          <th style={{ width: 100 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const overdue = isOverdue(order.deadline, order.status);

          return (
            <tr key={order.id}>
              {/* Cover */}
              <td>
                {order.gig_cover ? (
                  <img src={order.gig_cover} alt="" className="orders__cover" />
                ) : (
                  <div
                    className="orders__cover"
                    style={{
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    📄
                  </div>
                )}
              </td>

              {/* Gig */}
              <td>
                <span
                  style={{ cursor: "pointer", fontWeight: 500, color: "#111" }}
                  onClick={() => onView(order.id)}
                >
                  {order.gig_title ?? "—"}
                </span>
                <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: 2 }}>
                  #{order.id}
                </div>
              </td>

              {/* Expert */}
              <td>{order.expert_username}</td>

              {/* Status */}
              <td>{statusBadge(order.status)}</td>

              {/* Payment */}
              <td>{paymentBadge(order.payment_status)}</td>

              {/* Deadline */}
              <td>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: overdue ? "#d94f4f" : "inherit",
                    fontWeight: overdue ? 600 : 400,
                  }}
                >
                  {overdue && "⚠ "}
                  {formatDate(order.deadline)}
                </span>
              </td>

              {/* Price */}
              <td>
                <span className="orders__price">${order.total_price}</span>
              </td>

              {/* Actions */}
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageIcon onClick={() => onContact(order)} />
                  <ActionBtn onClick={() => onView(order.id)}>View</ActionBtn>
                  {order.status === "submitted" && (
                    <ActionBtn onClick={() => onView(order.id)} variant="green">
                      Approve
                    </ActionBtn>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Small shared components ──────────────────────────────────────────────────

function MessageIcon({ onClick }) {
  return (
    <svg
      className="orders__msg-icon"
      onClick={onClick}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ActionBtn({ children, onClick, disabled = false, variant = "default" }) {
  const base = {
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    fontFamily: "inherit",
    transition: "background 0.15s",
  };

  const variants = {
    default: { background: "#f0f0f0", color: "#444" },
    green:   { background: "#e6f9f0", color: "#1a9e60" },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
}