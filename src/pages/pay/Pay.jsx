import { useEffect, useState } from "react";
import "./pay.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams, useSearchParams } from "react-router-dom";
import CheckoutForm from "../../components/checkOutForm/CheckOutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Pay = () => {
  const { id } = useParams(); // gig id
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('package');

  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!packageId) { setError("No package selected."); return; }
    newRequest.post(`/gigs/orders/create-payment-intent/`, { package_id: packageId })
      .then((res) => {
        setClientSecret(res.data.client_secret);
        setOrderId(res.data.order_id);
      })
      .catch(() => setError("Failed to initialise payment. Please try again."));
  }, [packageId]);

  if (error) return <div className="pay"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="pay">
      {clientSecret && (
        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
          <CheckoutForm orderId={orderId} />
        </Elements>
      )}
    </div>
  );
};

export default Pay;