import './orders.scss';
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import { startConversation } from "../../api/messaging";

const Orders = () => {
  const navigate = useNavigate();
  const { isLoading, error, data } = useQuery({
    queryKey: ['orders'],
    queryFn: () => newRequest.get(`/gigs/orders/`).then((res) => res.data),
  });

  const handleContact = async (order) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isStudent = currentUser?.user_type === 'student';
    // Get the other party's user id from the order
    const recipientUsername = isStudent ? order.expert_username : order.student_username;
    try {
      await startConversation(recipientUsername);
      navigate('/messages');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="orders">
      {isLoading ? "Loading…" : error ? "Something went wrong" : (
        <div className="container">
          <div className="title"><h1>Orders</h1></div>
          <table>
            <tbody>
              <tr>
                <th>Cover</th>
                <th>Gig</th>
                <th>Package</th>
                <th>Price</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Contact</th>
              </tr>
              {data.map((order) => (
                <tr key={order.id}>
                  <td>
                    <img src={order.gig_cover || '/images/noavatar.jpeg'} alt="" className="img" />
                  </td>
                  <td>{order.gig_title}</td>
                  <td>{order.package?.tier}</td>
                  <td>${order.total_price}</td>
                  <td>
                    <span className={`status status--${order.status}`}>{order.status}</span>
                  </td>
                  <td>
                    <span className={`status status--${order.payment_status}`}>{order.payment_status}</span>
                  </td>
                  <td>
                    <img
                      className="message"
                      src="/images/message.png"
                      alt=""
                      onClick={() => handleContact(order)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;