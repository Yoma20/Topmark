import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, submitWork } from "../api/gigs";
import { startConversation } from "../api/messages";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  submitted:   "bg-purple-100 text-purple-800",
  completed:   "bg-green-100 text-green-800",
  archived:    "bg-gray-100 text-gray-600",
};

const PAYMENT_COLORS = {
  unpaid:   "bg-red-100 text-red-700",
  held:     "bg-orange-100 text-orange-700",
  released: "bg-green-100 text-green-700",
  refunded: "bg-gray-100 text-gray-600",
};

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
    { key: "active",    label: "Active",             filter: o => ["pending","in_progress","submitted"].includes(o.status) },
    { key: "awaiting",  label: "Awaiting Payout",    filter: o => o.status === "completed" && o.payment_status === "held" },
    { key: "paid",      label: "Paid Out",            filter: o => o.status === "completed" && o.payment_status === "released" },
  ];

  const STUDENT_TABS = [
    { key: "all",       label: "All",                filter: () => true },
    { key: "active",    label: "Active",             filter: o => ["pending","in_progress","submitted"].includes(o.status) },
    { key: "completed", label: "Completed",          filter: o => o.status === "completed" },
  ];

  const tabs = isExpert ? EXPERT_TABS : STUDENT_TABS;
  const currentTab = tabs.find(t => t.key === tab);
  const visible = orders.filter(currentTab?.filter ?? (() => true));

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleContact(order) {
    // Use the other party's user ID — what startConversation actually needs
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
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {isExpert ? "My Orders" : "My Orders"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {isExpert
          ? "Track work, submit deliverables, and monitor your payouts."
          : "Track the status of your orders and communicate with experts."}
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              tab === t.key
                ? "bg-white border border-b-white border-gray-200 text-indigo-600 -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              tab === t.key ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
            }`}>
              {orders.filter(t.filter).length}
            </span>
          </button>
        ))}
      </div>

      {/* Payout notice for expert awaiting tab */}
      {isExpert && tab === "awaiting" && visible.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
          💳 Payouts are processed manually every two weeks. Your net earnings (after 10% platform fee) will be transferred to your registered account.
        </div>
      )}

      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No orders here yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
  );
}

function OrderCard({ order, isExpert, submitting, onContact, onSubmitWork, onView }) {
  const deadlineDate = order.deadline ? new Date(order.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date() && order.status !== "completed";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 hover:shadow-sm transition-shadow">
      {/* Cover */}
      {order.gig_cover ? (
        <img
          src={order.gig_cover}
          alt={order.gig_title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📄</span>
        </div>
      )}

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-gray-900 truncate">{order.gig_title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Order #{order.id} ·{" "}
              {isExpert
                ? <>Student: <span className="font-medium">{order.student_username}</span></>
                : <>Expert: <span className="font-medium">{order.expert_username}</span></>}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
              {order.status.replace("_", " ")}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_COLORS[order.payment_status] ?? ""}`}>
              {order.payment_status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
          <span className="font-semibold text-gray-800">${order.total_price}</span>

          {deadlineDate && (
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              {isOverdue ? "⚠ Overdue · " : "Due "}
              {deadlineDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}

          {/* Expert: show if student submitted requirements */}
          {isExpert && order.status === "pending" && (
            <span className={order.requirements_submitted ? "text-green-600" : "text-yellow-600"}>
              {order.requirements_submitted ? "✓ Requirements received" : "⏳ Awaiting requirements"}
            </span>
          )}

          {/* Expert: payout info */}
          {isExpert && order.payment_status === "released" && (
            <span className="text-green-600 font-medium">
              ✓ Paid — net ${(order.total_price * 0.9).toFixed(2)}
            </span>
          )}
          {isExpert && order.payment_status === "held" && (
            <span className="text-orange-600">
              Pending payout — net ${(order.total_price * 0.9).toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onView}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
          >
            View Details
          </button>

          <button
            onClick={onContact}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
          >
            Message
          </button>

          {/* Expert submit work button */}
          {isExpert && order.status === "in_progress" && (
            <button
              onClick={onSubmitWork}
              disabled={submitting === order.id}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
            >
              {submitting === order.id ? "Submitting…" : "Submit Work"}
            </button>
          )}

          {/* Student approve button */}
          {!isExpert && order.status === "submitted" && (
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
            >
              Review & Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}