import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { getOrders, submitWork } from "../../api/gigs";
import { startConversation } from "../../api/messages";
import "./Orders.scss";

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isExpert = user?.user_type === "expert";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(isExpert ? "active" : "all");
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  // ── Tab logic ──────────────────────────────────────────────────────────────

  const EXPERT_TABS = [
    { key: "active",   label: "Active",          filter: o => ["pending","in_progress","submitted"].includes(o.status) },
    { key: "awaiting", label: "Awaiting Payout", filter: o => o.status === "completed" && o.payment_status === "held" },
    { key: "paid",     label: "Paid Out",         filter: o => o.status === "completed" && o.payment_status === "released" },
  ];

  const STUDENT_TABS = [
    { key: "all",       label: "All",       filter: () => true },
    { key: "active",    label: "Active",    filter: o => ["pending","in_progress","submitted"].includes(o.status) },
    { key: "completed", label: "Completed", filter: o => o.status === "completed" },
  ];

  const tabs = isExpert ? EXPERT_TABS : STUDENT_TABS;
  const currentTab = tabs.find(t => t.key === tab);
  const visible = orders.filter(currentTab?.filter ?? (() => true));

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleContact(order) {
    const recipientId = isExpert ? order.student_user_id : order.expert_user_id;
    try {
      const conv = await startConversation(recipientId);
      navigate(`/messages/${conv.id}`);
    } catch (e) {
      console.error("Could not start conversation", e);
    }
  }

  async function handleSubmitWork(orderId) {
    if (!window.confirm("Mark this order as submitted? The student will be notified.")) return;
    setSubmitting(orderId);
    try {
      await submitWork(orderId);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: "submitted" } : o
      ));
    } catch (e) {
      alert("Failed to submit work. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="orders__spinner">
      <div className="orders__spinner-ring" />
    </div>
  );

  return (
    <div className="orders">
      <div className="orders__container">

        {/* Header */}
        <div className="orders__header">
          <h1 className="orders__title">My Orders</h1>
          <p className="orders__subtitle">
            {isExpert
              ? "Track work, submit deliverables, and monitor your payouts."
              : "Track the status of your orders and communicate with experts."}
          </p>
        </div>

        {/* Tabs */}
        <div className="orders__tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`orders__tab${tab === t.key ? " orders__tab--active" : ""}`}
            >
              {t.label}
              <span className="orders__tab-count">
                {orders.filter(t.filter).length}
              </span>
            </button>
          ))}
        </div>

        {/* Payout notice */}
        {isExpert && tab === "awaiting" && visible.length > 0 && (
          <div className="orders__notice orders__notice--payout">
            <span className="orders__notice__icon">💳</span>
            Payouts are processed manually every two weeks. Your net earnings
            (after 10% platform fee) will be transferred to your registered account.
          </div>
        )}

        {/* List / empty state */}
        {visible.length === 0 ? (
          <div className="orders__empty">
            <p className="orders__empty-icon">📭</p>
            <p className="orders__empty-text">No orders here yet.</p>
          </div>
        ) : (
          <div className="orders__list">
            {visible.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isExpert={isExpert}
                submitting={submitting}
                onContact={() => handleContact(order)}
                onSubmitWork={() => handleSubmitWork(order.id)}
                onView={() => navigate(`/orders/${order.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function OrderCard({ order, isExpert, submitting, onContact, onSubmitWork, onView }) {
  const navigate = useNavigate();
  const deadlineDate = order.deadline ? new Date(order.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date() && order.status !== "completed";

  return (
    <div className={`order-card${isOverdue ? " order-card--overdue" : ""}`}>

      {/* Cover */}
      {order.gig_cover ? (
        <img
          src={order.gig_cover}
          alt={order.gig_title}
          className="order-card__cover"
        />
      ) : (
        <div className="order-card__cover-placeholder">📄</div>
      )}

      {/* Body */}
      <div className="order-card__body">
        <div className="order-card__top">
          <div>
            <p className="order-card__title">{order.gig_title}</p>
            <p className="order-card__meta">
              Order #{order.id} ·{" "}
              {isExpert
                ? <>Student: <strong>{order.student_username}</strong></>
                : <>Expert: <strong>{order.expert_username}</strong></>}
            </p>
          </div>

          <div className="order-card__badges">
            <span className={`badge badge--${order.status}`}>
              {order.status.replace("_", " ")}
            </span>
            <span className={`badge badge--pay-${order.payment_status}`}>
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* Info row */}
        <div className="order-card__info">
          <span className="order-card__price">${order.total_price}</span>

          {deadlineDate && (
            <span className={`order-card__deadline${isOverdue ? " order-card__deadline--overdue" : ""}`}>
              {isOverdue ? "⚠ Overdue · " : "Due "}
              {deadlineDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}

          {isExpert && order.status === "pending" && (
            <span className={`order-card__hint order-card__hint--${order.requirements_submitted ? "ok" : "warn"}`}>
              {order.requirements_submitted ? "✓ Requirements received" : "⏳ Awaiting requirements"}
            </span>
          )}

          {isExpert && order.payment_status === "released" && (
            <span className="order-card__hint order-card__hint--paid">
              ✓ Paid — net ${(order.total_price * 0.9).toFixed(2)}
            </span>
          )}

          {isExpert && order.payment_status === "held" && (
            <span className="order-card__hint order-card__hint--pay">
              Pending payout — net ${(order.total_price * 0.9).toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="order-card__actions">
          <button onClick={onView} className="btn btn--outline">
            View Details
          </button>

          <button onClick={onContact} className="btn btn--ghost">
            Message
          </button>

          {isExpert && order.status === "in_progress" && (
            <button
              onClick={onSubmitWork}
              disabled={submitting === order.id}
              className="btn btn--success"
            >
              {submitting === order.id ? "Submitting…" : "Submit Work"}
            </button>
          )}

          {!isExpert && order.status === "submitted" && (
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="btn btn--success"
            >
              Review & Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}