import { useState } from "react";
import newRequest from "../../utils/newRequest";
import "./SendOfferModal.scss";

/**
 * SendOfferModal
 * Opened by the expert from the ChatWindow toolbar.
 *
 * Props:
 *   convId        – conversation id
 *   gigPackages   – array of packages from the linked gig (may be empty)
 *   parentOffer   – if counter-offering, the offer being countered
 *   onClose       – close handler
 *   onSent        – callback after successful send (refetch messages)
 */
const SendOfferModal = ({ convId, gigPackages = [], parentOffer = null, onClose, onSent }) => {
  const [form, setForm] = useState({
    title: parentOffer?.title || "",
    description: parentOffer?.description || "",
    price: parentOffer?.price || "",
    delivery_days: parentOffer?.delivery_days || "",
    revision_number: parentOffer?.revision_number ?? 1,
    package_id: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Pre-fill from a selected package
  const handlePackageSelect = (e) => {
    const pkgId = e.target.value;
    const pkg = gigPackages.find((p) => String(p.id) === pkgId);
    if (pkg) {
      setForm({
        title: pkg.name,
        description: pkg.description || "",
        price: pkg.price,
        delivery_days: pkg.delivery_days,
        revision_number: pkg.revision_number,
        package_id: pkgId,
      });
    } else {
      setForm((f) => ({ ...f, package_id: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.price || !form.delivery_days) {
      setError("Title, price and delivery days are required.");
      return;
    }

    setSending(true);
    try {
      await newRequest.post(`/messaging/conversations/${convId}/offer/`, {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        delivery_days: parseInt(form.delivery_days),
        revision_number: parseInt(form.revision_number) || 0,
        package_id: form.package_id ? parseInt(form.package_id) : null,
        parent_offer_id: parentOffer?.id || null,
      });
      onSent?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to send offer. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="offer-modal-overlay" onClick={onClose}>
      <div className="offer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="offer-modal__header">
          <h2>{parentOffer ? "Counter Offer" : "Send Custom Offer"}</h2>
          <button className="offer-modal__close" onClick={onClose}>✕</button>
        </div>

        {gigPackages.length > 0 && (
          <div className="offer-modal__prefill">
            <label>Start from a package (optional)</label>
            <select value={form.package_id} onChange={handlePackageSelect}>
              <option value="">— Custom offer —</option>
              {gigPackages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — ${pkg.price}
                </option>
              ))}
            </select>
          </div>
        )}

        <form className="offer-modal__form" onSubmit={handleSubmit}>
          <div className="offer-modal__field">
            <label htmlFor="offer-title">Offer title *</label>
            <input
              id="offer-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Custom 5-page essay with bibliography"
              maxLength={200}
              required
            />
          </div>

          <div className="offer-modal__field">
            <label htmlFor="offer-desc">Description</label>
            <textarea
              id="offer-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe exactly what's included…"
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="offer-modal__row">
            <div className="offer-modal__field">
              <label htmlFor="offer-price">Price (USD) *</label>
              <input
                id="offer-price"
                name="price"
                type="number"
                min="1"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="offer-modal__field">
              <label htmlFor="offer-days">Delivery (days) *</label>
              <input
                id="offer-days"
                name="delivery_days"
                type="number"
                min="1"
                max="365"
                value={form.delivery_days}
                onChange={handleChange}
                placeholder="3"
                required
              />
            </div>

            <div className="offer-modal__field">
              <label htmlFor="offer-revisions">Revisions</label>
              <input
                id="offer-revisions"
                name="revision_number"
                type="number"
                min="0"
                max="20"
                value={form.revision_number}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className="offer-modal__error">{error}</p>}

          <button
            type="submit"
            className="offer-modal__submit"
            disabled={sending}
          >
            {sending ? "Sending…" : parentOffer ? "Send Counter Offer" : "Send Offer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendOfferModal;