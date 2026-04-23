import { useLocation, useNavigate } from 'react-router-dom';
import './success.scss';
import { useEffect, useState } from 'react';
import newRequest from '../../utils/newRequest';

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const orderId = params.get('order_id');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!orderId) { setStatus('error'); return; }
    // Submit requirements immediately after payment confirmed
    // (requirements form comes next — redirect to requirements page)
    setTimeout(() => navigate(`/orders/${orderId}/requirements`), 3000);
    setStatus('success');
  }, [orderId]);

  return (
    <div className="success">
      {status === 'loading' && <p>Confirming payment…</p>}
      {status === 'success' && (
        <>
          <img src="/images/successfully-done.gif" alt="" />
          <p>Payment confirmed! Redirecting you to fill in your requirements…</p>
          <span>Please do not close this page.</span>
        </>
      )}
      {status === 'error' && <p style={{ color: 'red' }}>Something went wrong.</p>}
    </div>
  );
};

export default Success;