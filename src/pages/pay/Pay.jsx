import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import newRequest from "../../utils/newRequest";
import "./pay.scss";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const BANK_DETAILS = {
  accountName:   "TopMark Academic Services",
  bankName:      "Grey (USD Account)",
  accountNumber: "YOUR_GREY_ACCOUNT_NUMBER",
  routingNumber: "YOUR_GREY_ROUTING_NUMBER",
  swift:         "YOUR_SWIFT_CODE",
  reference:     "ORDER-",   // append orderId
};

const Pay = () => {
  const { id, token }       = useParams();
  const [searchParams]      = useSearchParams();
  const packageId           = searchParams.get("package");
  const navigate            = useNavigate();

  // token flow  → /pay/token/:token   (offer-based, secure)
  // legacy flow → /pay/:id?package=X  (gig package)
  const isTokenFlow = Boolean(token);

  const [method, setMethod]                   = useState(null);   // 'paypal' | 'bank'
  const [orderAmount, setOrderAmount]         = useState(null);
  const [resolvedOrderId, setResolvedOrderId] = useState(null);
  const [resolvedToken, setResolvedToken]     = useState(null);   // keep token alive for confirm step
  const [error, setError]                     = useState("");
  const [bankConfirmed, setBankConfirmed]     = useState(false);
  const [confirming, setConfirming]           = useState(false);

  // ── Resolve order + amount ────────────────────────────────────────────────
  useEffect(() => {
    if (isTokenFlow) {
      // Redeem the one-time token — server validates user + expiry
      newRequest
        .post("/messaging/pay-token/redeem/", { token })
        .then(res => {
          setOrderAmount(res.data.amount);
          setResolvedOrderId(res.data.order_id);
          setResolvedToken(token);   // keep it so confirm-payment can delete it server-side
        })
        .catch(() =>
          setError("Payment link expired or invalid. Please go back and try again.")
        );
      return;
    }

    // Legacy gig-package flow
    if (!packageId) {
      setError("No package selected.");
      return;
    }
    newRequest
      .post(`/gigs/orders/create-payment-intent/`, { package_id: packageId })
      .then(res => {
        setOrderAmount(res.data.amount || res.data.total_price);
        setResolvedOrderId(res.data.order_id);
      })
      .catch(() => setError("Failed to load order. Please try again."));
  }, [isTokenFlow, token, packageId]);

  // ── PayPal approval handler ───────────────────────────────────────────────
  const handlePayPalApprove = async (data, actions) => {
    try {
      await actions.order.capture();
      const confirmUrl = isTokenFlow
        ? `/messaging/orders/${resolvedOrderId}/confirm-payment/`
        : `/gigs/orders/${resolvedOrderId}/confirm-payment/`;
      await newRequest.post(confirmUrl, {
        method: "paypal",
        paypal_order_id: data.orderID,
        ...(isTokenFlow && { pay_token: resolvedToken }),
      });
      navigate(`/success?order_id=${resolvedOrderId}`);
    } catch {
      setError("Payment captured but confirmation failed. Please contact support.");
    }
  };

  // ── Bank transfer confirmation ────────────────────────────────────────────
  const handleBankConfirm = async () => {
    setConfirming(true);
    try {
      const confirmUrl = isTokenFlow
        ? `/messaging/orders/${resolvedOrderId}/confirm-payment/`
        : `/gigs/orders/${resolvedOrderId}/confirm-payment/`;
      await newRequest.post(confirmUrl, {
        method: "bank_transfer",
        ...(isTokenFlow && { pay_token: resolvedToken }),
      });
      setBankConfirmed(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="pay pay--error">
        <div className="pay__error-box">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!orderAmount || !resolvedOrderId) {
    return (
      <div className="pay pay--loading">
        <div className="pay__spinner" />
        <p>Loading order details…</p>
      </div>
    );
  }

  return (
    <div className="pay">
      <div className="pay__card">

        {/* Header */}
        <div className="pay__header">
          <h1 className="pay__title">Complete Payment</h1>
          <div className="pay__amount">
            <span className="pay__amount-label">Order Total</span>
            <span className="pay__amount-value">${parseFloat(orderAmount).toFixed(2)}</span>
          </div>
          <p className="pay__order-ref">Order #{resolvedOrderId}</p>
        </div>

        {/* Method selection */}
        {!method && (
          <div className="pay__methods">
            <p className="pay__methods-label">Choose a payment method</p>

            {PAYPAL_CLIENT_ID ? (
              <button
                className="pay__method-btn pay__method-btn--paypal"
                onClick={() => setMethod("paypal")}
              >
                <img
                  src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png"
                  alt="PayPal"
                  className="pay__method-logo"
                />
                <div className="pay__method-info">
                  <span className="pay__method-name">Pay with PayPal</span>
                  <span className="pay__method-desc">Fast, secure checkout. Supports all major cards.</span>
                </div>
                <span className="pay__method-arrow">→</span>
              </button>
            ) : (
              <div className="pay__method-btn pay__method-btn--disabled" aria-disabled="true">
                <img
                  src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png"
                  alt="PayPal"
                  className="pay__method-logo pay__method-logo--muted"
                />
                <div className="pay__method-info">
                  <span className="pay__method-name">Pay with PayPal</span>
                  <span className="pay__method-desc pay__method-desc--warn">
                    PayPal is temporarily unavailable. Please use bank transfer.
                  </span>
                </div>
              </div>
            )}

            <div className="pay__divider"><span>or</span></div>

            <button
              className="pay__method-btn pay__method-btn--bank"
              onClick={() => setMethod("bank")}
            >
              <div className="pay__method-icon" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-building-bank" style={{ fontSize: 20 }} />
              </div>
              <div className="pay__method-info">
                <span className="pay__method-name">Bank Transfer</span>
                <span className="pay__method-desc">Transfer directly to our USD account.</span>
              </div>
              <span className="pay__method-arrow">→</span>
            </button>
          </div>
        )}

        {/* PayPal flow */}
        {method === "paypal" && PAYPAL_CLIENT_ID && (
          <div className="pay__paypal">
            <button className="pay__back" onClick={() => setMethod(null)}>← Back</button>
            <p className="pay__section-title">Pay securely with PayPal</p>
            <PayPalScriptProvider options={{
              "client-id": PAYPAL_CLIENT_ID,
              currency: "USD",
            }}>
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                createOrder={(data, actions) =>
                  actions.order.create({
                    purchase_units: [{
                      amount: { value: parseFloat(orderAmount).toFixed(2) },
                      description: `TopMark Order #${resolvedOrderId}`,
                    }],
                  })
                }
                onApprove={handlePayPalApprove}
                onError={() => setError("PayPal payment failed. Please try again.")}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {/* Bank transfer flow */}
        {method === "bank" && !bankConfirmed && (
          <div className="pay__bank">
            <button className="pay__back" onClick={() => setMethod(null)}>← Back</button>
            <p className="pay__section-title">Bank Transfer Instructions</p>

            <div className="pay__bank-box">
              <p className="pay__bank-note">
                Transfer exactly <strong>${parseFloat(orderAmount).toFixed(2)} USD</strong> to
                the account below. Your order will be activated once we confirm receipt (usually
                within 24 hours).
              </p>

              <div className="pay__bank-details">
                <div className="pay__bank-row">
                  <span className="pay__bank-label">Account Name</span>
                  <span className="pay__bank-value">{BANK_DETAILS.accountName}</span>
                </div>
                <div className="pay__bank-row">
                  <span className="pay__bank-label">Bank</span>
                  <span className="pay__bank-value">{BANK_DETAILS.bankName}</span>
                </div>
                <div className="pay__bank-row">
                  <span className="pay__bank-label">Account Number</span>
                  <span className="pay__bank-value">{BANK_DETAILS.accountNumber}</span>
                </div>
                <div className="pay__bank-row">
                  <span className="pay__bank-label">Routing Number</span>
                  <span className="pay__bank-value">{BANK_DETAILS.routingNumber}</span>
                </div>
                <div className="pay__bank-row">
                  <span className="pay__bank-label">SWIFT / BIC</span>
                  <span className="pay__bank-value">{BANK_DETAILS.swift}</span>
                </div>
                <div className="pay__bank-row pay__bank-row--highlight">
                  <span className="pay__bank-label">Reference</span>
                  <span className="pay__bank-value">{BANK_DETAILS.reference}{resolvedOrderId}</span>
                </div>
              </div>

              <p className="pay__bank-warning">
                IN BETA! Please use Paypal the Paypal Card Processor instead
              </p>
            </div>

            <p className="pay__bank-confirm-text">
              Once you have made the transfer, click below to notify us.
            </p>

            <button
              className="pay__confirm-btn"
              onClick={handleBankConfirm}
              disabled={confirming}
            >
              {confirming ? "Submitting…" : "I've Made the Transfer"}
            </button>
          </div>
        )}

        {/* Bank transfer confirmed */}
        {method === "bank" && bankConfirmed && (
          <div className="pay__bank-success">
            <span className="pay__success-icon">✅</span>
            <h2>Transfer Noted!</h2>
            <p>
              We'll verify your payment and activate your order within <strong>24 hours</strong>.
              You'll receive an email confirmation at that point.
            </p>
            <p className="pay__bank-ref">
              Reference: <strong>{BANK_DETAILS.reference}{resolvedOrderId}</strong>
            </p>
            <button
              className="pay__confirm-btn"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Pay;