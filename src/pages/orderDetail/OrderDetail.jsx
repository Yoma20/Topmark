import { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AuthContext from "../../AuthContext.jsx";
import newRequest from "../../utils/newRequest";
import "./orderDetail.scss";

const CITATION_STYLES = ["APA", "MLA", "Harvard", "Chicago", "Vancouver", "None"];

const STATUS_LABELS = {
  pending:     "Pending",
  in_progress: "In Progress",
  submitted:   "Submitted — Awaiting Approval",
  completed:   "Completed",
  archived:    "Archived",
};

const PAY_LABELS = {
  unpaid:   "Unpaid",
  held:     "Payment Held",
  released: "Payment Released",
  refunded: "Refunded",
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isExpert = user?.user_type === "expert";

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [approveError, setApproveError] = useState("");

  // ── Fetch order ────────────────────────────────────────────────────────────

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => newRequest.get(`/gigs/orders/${orderId}/`).then(r => r.data),
  });

  // ── Approve delivery ───────────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: () => newRequest.post(`/gigs/orders/${orderId}/approve/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
      queryClient.invalidateQueries(["orders"]);
      setApproveError("");
    },
    onError: (err) => {
      setApproveError(err?.response?.data?.detail || "Could not approve delivery. Please try again.");
    },
  });

  // ── Submit review ──────────────────────────────────────────────────────────

  const reviewMutation = useMutation({
    mutationFn: () =>
      newRequest.post(`/gigs/orders/${orderId}/review/`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
      setReviewError("");
    },
    onError: (err) => {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Could not submit review. Please try again.";
      setReviewError(detail);
    },
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewError("");
    if (!reviewForm.comment.trim()) {
      setReviewError("Please write a comment before submitting.");
      return;
    }
    reviewMutation.mutate();
  };

  // ── Contact ────────────────────────────────────────────────────────────────

  async function handleContact() {
    const recipientId = isExpert ? order.student_user_id : order.expert_user_id;
    try {
      const res = await newRequest.post("/messaging/conversations/start/", { recipient_id: recipientId });
      navigate(`/messages/${res.data.id}`);
    } catch {
      console.error("Could not start conversation");
    }
  }

  // ── States ─────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="od od--loading"><div className="od__spinner" /></div>
  );

  if (error) return (
    <div className="od od--error">
      <p>Order not found or you don't have access.</p>
      <button onClick={() => navigate("/orders")} className="od__btn od__btn--primary">Back to Orders</button>
    </div>
  );

  const deadlineDate = order.deadline ? new Date(order.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date() && order.status !== "completed";
  const canApprove = !isExpert && order.status === "submitted";
  const canReview  = !isExpert && order.status === "completed" && !order.has_review;

  return (
    <div className="od">
      <div className="od__container">

        {/* Back */}
        <button className="od__back" onClick={() => navigate("/orders")}>← My Orders</button>

        {/* Header */}
        <div className="od__header">
          <div className="od__header-left">
            <h1 className="od__title">{order.gig_title}</h1>
            <p className="od__ref">Order #{order.id}</p>
          </div>
          <div className="od__badges">
            <span className={`od__badge od__badge--${order.status}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <span className={`od__badge od__badge--pay-${order.payment_status}`}>
              {PAY_LABELS[order.payment_status] ?? order.payment_status}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="od__grid">
          <InfoCard label="Total paid" value={`$${parseFloat(order.total_price).toFixed(2)}`} />
          <InfoCard
            label="Deadline"
            value={deadlineDate
              ? deadlineDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
              : "—"}
            warn={isOverdue}
          />
          <InfoCard label={isExpert ? "Student" : "Expert"} value={isExpert ? order.student_username : order.expert_username} />
          <InfoCard label="Package" value={order.package_name ?? "—"} />
        </div>

        {/* Requirements */}
        {order.requirements && (
          <Section title="Requirements submitted">
            <div className="od__req-grid">
              <ReqRow label="Citation style" value={order.requirements.citation_style} />
              <ReqRow label="Word count"     value={order.requirements.word_count ? `${order.requirements.word_count} words` : "—"} />
              {order.requirements.additional_notes && (
                <ReqRow label="Notes" value={order.requirements.additional_notes} multiline />
              )}
              {order.requirements.rubric_file && (
                <ReqRow label="Rubric">
                  <a href={order.requirements.rubric_file} target="_blank" rel="noreferrer" className="od__link">
                    Download rubric
                  </a>
                </ReqRow>
              )}
            </div>
          </Section>
        )}

        {/* Submitted work — visible once expert submits */}
        {order.status === "submitted" || order.status === "completed" ? (
          order.delivery_file || order.delivery_notes ? (
            <Section title="Delivered work">
              {order.delivery_notes && (
                <p className="od__delivery-notes">{order.delivery_notes}</p>
              )}
              {order.delivery_file && (
                <a href={order.delivery_file} target="_blank" rel="noreferrer" className="od__download-btn">
                  ↓ Download Deliverable
                </a>
              )}
            </Section>
          ) : (
            <Section title="Delivered work">
              <p className="od__muted">No file attached — check your messages for the delivery.</p>
            </Section>
          )
        ) : null}

        {/* Approve delivery */}
        {canApprove && (
          <Section title="Approve delivery">
            <p className="od__approve-text">
              Happy with the work? Approving releases payment to the expert and marks the order complete.
              This action cannot be undone.
            </p>
            {approveError && <div className="od__error">{approveError}</div>}
            <div className="od__approve-actions">
              <button
                className="od__btn od__btn--primary"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Approving…" : "Approve & Release Payment"}
              </button>
              <button className="od__btn od__btn--ghost" onClick={handleContact}>
                Message Expert First
              </button>
            </div>
          </Section>
        )}

        {/* Review form */}
        {canReview && (
          <Section title="Leave a review">
            <p className="od__muted">Help other students by sharing your experience.</p>
            {reviewError && <div className="od__error">{reviewError}</div>}
            <form className="od__review-form" onSubmit={handleReviewSubmit}>
              <div className="od__review-stars">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`od__star${reviewForm.rating >= n ? " od__star--active" : ""}`}
                    onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
                <span className="od__star-label">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewForm.rating]}
                </span>
              </div>
              <textarea
                className="od__review-textarea"
                rows={4}
                placeholder="Describe your experience with this expert…"
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              />
              <button
                type="submit"
                className="od__btn od__btn--primary"
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </Section>
        )}

        {/* Review already submitted */}
        {!isExpert && order.status === "completed" && order.has_review && (
          <Section title="Your review">
            <div className="od__review-submitted">
              <span className="od__review-stars-static">
                {"★".repeat(order.review?.rating ?? 0)}{"☆".repeat(5 - (order.review?.rating ?? 0))}
              </span>
              <p>{order.review?.comment}</p>
            </div>
          </Section>
        )}

        {/* Actions footer */}
        <div className="od__footer-actions">
          <button className="od__btn od__btn--ghost" onClick={handleContact}>
            Message {isExpert ? "Student" : "Expert"}
          </button>
          {!isExpert && order.status === "pending" && !order.requirements_submitted && (
            <button
              className="od__btn od__btn--primary"
              onClick={() => navigate(`/orders/${orderId}/requirements`)}
            >
              Submit Requirements
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="od__section">
      <h2 className="od__section-title">{title}</h2>
      {children}
    </div>
  );
}

function InfoCard({ label, value, warn }) {
  return (
    <div className={`od__info-card${warn ? " od__info-card--warn" : ""}`}>
      <span className="od__info-label">{label}</span>
      <span className="od__info-value">{value}</span>
    </div>
  );
}

function ReqRow({ label, value, multiline, children }) {
  return (
    <div className="od__req-row">
      <span className="od__req-label">{label}</span>
      {children ?? (
        multiline
          ? <span className="od__req-value od__req-value--multi">{value}</span>
          : <span className="od__req-value">{value}</span>
      )}
    </div>
  );
}