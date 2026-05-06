import { useEffect, useState } from "react";
import "./pay.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams, useSearchParams } from "react-router-dom";
import CheckoutForm from "../../components/checkOutForm/CheckOutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Pay handles two entry points:
 *
 * 1. Offer-based (new flow):
 *    URL: /pay/offer/:orderId
 *    The client_secret was stored in sessionStorage by OfferCard after acceptance.
 *    No need to create a new payment intent — it already exists.
 *
 * 2. Legacy package-based flow (kept for backward compat, can be removed later):
 *    URL: /pay/:gigId?package=:packageId
 */
const Pay = () => {
  const { id, orderId } = useParams();   // id = gigId (legacy), orderId = from offer flow
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get("package");

  const isOfferFlow = Boolean(orderId);

  const [clientSecret, setClientSecret] = useState("");
  const [resolvedOrderId, setResolvedOrderId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOfferFlow) {
      // Retrieve client_secret that was stored by OfferCard on acceptance
      const stored = sessionStorage.getItem(`pi_${orderId}`);
      if (stored) {
        setClientSecret(stored);
        setResolvedOrderId(parseInt(orderId));
        sessionStorage.removeItem(`pi_${orderId}`);
      } else {
        setError("Payment session expired. Please go back and try again.");
      }
      return;
    }

    // ── Legacy flow ──────────────────────────────────────────────────────────
    if (!packageId) { setError("No package selected."); return; }
    newRequest
      .post(`/gigs/orders/create-payment-intent/`, { package_id: packageId })
      .then((res) => {
        setClientSecret(res.data.client_secret);
        setResolvedOrderId(res.data.order_id);
      })
      .catch(() => setError("Failed to initialise payment. Please try again."));
  }, [isOfferFlow, orderId, packageId]);

  if (error) {
    return (
      <div className="pay">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="pay">
      {clientSecret && (
        <Elements
          options={{ clientSecret, appearance: { theme: "stripe" } }}
          stripe={stripePromise}
        >
          <CheckoutForm orderId={resolvedOrderId} />
        </Elements>
      )}
    </div>
  );
};

export default Pay;