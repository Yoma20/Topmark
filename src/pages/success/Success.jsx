import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./success.scss";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const orderId = params.get("order_id");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/orders/${orderId}/requirements`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orderId, navigate]);

  if (!orderId) {
    return (
      <div className="success success--error">
        <div className="success__box">
          <div className="success__icon success__icon--error">!</div>
          <h2>Something went wrong</h2>
          <p>No order ID found. If you were charged, please contact support with your payment reference.</p>
          <button onClick={() => navigate("/orders")} className="success__btn">
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="success">
      <div className="success__box">
        <div className="success__icon success__icon--ok">✓</div>
        <h2>Payment Confirmed!</h2>
        <p>
          Your order <strong>#{orderId}</strong> is placed. Now tell the expert
          exactly what you need — the more detail, the better.
        </p>
        <p className="success__redirect">
          Redirecting in <strong>{countdown}s</strong>…
        </p>
        <button
          onClick={() => navigate(`/orders/${orderId}/requirements`)}
          className="success__btn"
        >
          Fill In Requirements Now
        </button>
      </div>
    </div>
  );
};

export default Success;