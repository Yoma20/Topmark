import newRequest from "../../utils/newRequest";
import "./OfferCard.scss";

/**
 * OfferCard
 * Rendered inside the chat thread when a message has message_type === "offer".
 *
 * Props:
 *   offer          – the offer object (from MessageSerializer)
 *   currentUserId  – logged-in user's id
 *   onResponded    – callback fired after accept/decline so parent can refetch
 */
const OfferCard = ({ offer, currentUserId, onResponded }) => {
  const isMine = offer.sender.id === currentUserId;
  const isPending = offer.status === "pending";

  const handleRespond = async (action) => {
    try {
      const res = await newRequest.post(`/messaging/offers/${offer.id}/respond/`, { action });
      if (action === "accept") {
        const { pay_token } = res.data;
        // Redirect to secure token-based payment URL — no order ID exposed
        window.location.href = `/pay/token/${pay_token}`;
      } else {
        onResponded?.();
      }
    } catch (err) {
      console.error("Failed to respond to offer", err);
    }
  };

  const statusLabel = {
    pending: null,
    accepted: "✓ Accepted",
    declined: "✗ Declined",
    countered: "↩ Countered",
    expired: "Expired",
  }[offer.status];

  return (
    <div className={`offer-card offer-card--${offer.status}`}>
      <div className="offer-card__header">
        <span className="offer-card__label">Custom Offer</span>
        {statusLabel && (
          <span className={`offer-card__status offer-card__status--${offer.status}`}>
            {statusLabel}
          </span>
        )}
      </div>

      <div className="offer-card__title">{offer.title}</div>

      {offer.description && (
        <p className="offer-card__desc">{offer.description}</p>
      )}

      <div className="offer-card__meta">
        <div className="offer-card__meta-item">
          <span className="offer-card__meta-label">Price</span>
          <span className="offer-card__meta-value">${parseFloat(offer.price).toFixed(2)}</span>
        </div>
        <div className="offer-card__meta-item">
          <span className="offer-card__meta-label">Delivery</span>
          <span className="offer-card__meta-value">{offer.delivery_days} days</span>
        </div>
        <div className="offer-card__meta-item">
          <span className="offer-card__meta-label">Revisions</span>
          <span className="offer-card__meta-value">{offer.revision_number}</span>
        </div>
      </div>

      {/* Action buttons — only shown to the OTHER party when offer is pending */}
      {!isMine && isPending && (
        <div className="offer-card__actions">
          <button
            className="offer-card__btn offer-card__btn--accept"
            onClick={() => handleRespond("accept")}
          >
            Accept & Pay
          </button>
          <button
            className="offer-card__btn offer-card__btn--decline"
            onClick={() => handleRespond("decline")}
          >
            Decline
          </button>
        </div>
      )}

      {isMine && isPending && (
        <p className="offer-card__awaiting">Awaiting buyer response…</p>
      )}
    </div>
  );
};

export default OfferCard;