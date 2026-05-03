// src/pages/home/Dashboard.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "../../AuthContext";
import newRequest from "../../utils/newRequest";
import GigCard from "../../components/GigCard/GigCard";
import "./Dashboard.scss";

const CATEGORIES = [
  { emoji: "⚖️", label: "Law & Legal",     search: "Law" },
  { emoji: "🏥", label: "Nursing",          search: "Nursing" },
  { emoji: "🔒", label: "Cybersecurity",    search: "Cybersecurity" },
  { emoji: "🧬", label: "Biology",          search: "Biology" },
  { emoji: "📜", label: "History",          search: "History" },
  { emoji: "📊", label: "Data Science",     search: "Data Science" },
  { emoji: "💻", label: "Computer Science", search: "Computer Science" },
  { emoji: "📈", label: "Business",         search: "Business" },
  { emoji: "🧠", label: "Psychology",       search: "Psychology" },
  { emoji: "✍️", label: "Essay Writing",    search: "Essay Writing" },
  { emoji: "🧪", label: "Chemistry",        search: "Chemistry" },
  { emoji: "➗", label: "Mathematics",      search: "Mathematics" },
];

// Subject logos using worldvectorlogo / simpleicons style SVG colors
const CATEGORY_COLORS = [
  "#7c3aed","#059669","#2563eb","#16a34a",
  "#d97706","#7c3aed","#0891b2","#dc2626",
  "#7c3aed","#059669","#0891b2","#2563eb",
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch recommended gigs
  const { data: gigs, isLoading } = useQuery({
    queryKey: ["dashboard-gigs"],
    queryFn: () => newRequest.get("/gigs/?sort=sales").then(r => r.data),
  });

  // Fetch orders
  const { data: orders } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: () => newRequest.get("/gigs/orders/").then(r => r.data),
    enabled: !!user,
  });

  // Fetch unread messages count
  const { data: unreadData } = useQuery({
    queryKey: ["unread"],
    queryFn: () => newRequest.get("/messaging/unread-count/").then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const activeOrders = orders?.filter(o =>
    ["pending","in_progress","submitted"].includes(o.status)
  ) || [];

  return (
    <div className="dashboard">

      {/* ── Welcome banner ── */}
      <section className="dashboard-welcome">
        <div className="dashboard-welcome__inner">
          <div>
            <h1>Welcome back, <span>{user?.username}</span> 👋</h1>
            <p>Find a verified expert for your next assignment</p>
          </div>
          <div className="dashboard-welcome__actions">
            {activeOrders.length > 0 && (
              <button
                className="btn-outline"
                onClick={() => navigate("/orders")}
              >
                📋 {activeOrders.length} Active Order{activeOrders.length > 1 ? "s" : ""}
              </button>
            )}
            {unreadData?.unread_count > 0 && (
              <button
                className="btn-outline"
                onClick={() => navigate("/messages")}
              >
                💬 {unreadData.unread_count} New Message{unreadData.unread_count > 1 ? "s" : ""}
              </button>
            )}
            {user?.user_type === "expert" && (
              <button
                className="btn-primary"
                onClick={() => navigate("/add")}
              >
                + Add New Gig
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Quick search ── */}
      <section className="dashboard-search">
        <div className="dashboard-search__bar">
          <span>🔍</span>
          <input
            type="text"
            placeholder='Search for experts — try "nursing care plan" or "law essay APA"'
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                navigate(`/gigs?search=${encodeURIComponent(e.target.value)}`);
              }
            }}
          />
          <button onClick={(e) => {
            const input = e.target.closest(".dashboard-search__bar").querySelector("input");
            if (input.value.trim()) navigate(`/gigs?search=${encodeURIComponent(input.value)}`);
          }}>
            Search
          </button>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Browse by Subject</h2>
          <span onClick={() => navigate("/gigs")}>See all →</span>
        </div>
        <div className="dashboard-cats">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.label}
              className="dashboard-cat"
              onClick={() => navigate(`/gigs?search=${encodeURIComponent(cat.search)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/gigs?search=${encodeURIComponent(cat.search)}`)}
            >
              <div
                className="dashboard-cat__icon"
                style={{ background: CATEGORY_COLORS[i] + "18", border: `1.5px solid ${CATEGORY_COLORS[i]}30` }}
              >
                <span>{cat.emoji}</span>
              </div>
              <span className="dashboard-cat__label">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Active orders (if any) ── */}
      {activeOrders.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>Your Active Orders</h2>
            <span onClick={() => navigate("/orders")}>View all →</span>
          </div>
          <div className="dashboard-orders">
            {activeOrders.slice(0, 3).map(order => (
              <div key={order.id} className="dashboard-order-card">
                <img
                  src={order.gig_cover || "/images/noavatar.jpeg"}
                  alt={order.gig_title}
                />
                <div className="dashboard-order-card__info">
                  <h4>{order.gig_title}</h4>
                  <p>{order.package?.tier} package · ${order.total_price}</p>
                  <div className={`status-pill status-pill--${order.status}`}>
                    {order.status.replace("_", " ")}
                  </div>
                </div>
                <button onClick={() => navigate("/orders")}>View</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recommended gigs ── */}
      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Recommended Experts</h2>
          <span onClick={() => navigate("/gigs")}>See all →</span>
        </div>
        {isLoading ? (
          <div className="dashboard-loading">Loading experts…</div>
        ) : !gigs?.length ? (
          <div className="dashboard-empty">
            <p>No experts yet — be the first to join!</p>
            {user?.user_type === "expert" && (
              <button className="btn-primary" onClick={() => navigate("/add")}>
                Create Your First Gig
              </button>
            )}
          </div>
        ) : (
          <div className="dashboard-gigs">
            {gigs.slice(0, 8).map(gig => (
              <GigCard key={gig.id} item={gig} />
            ))}
          </div>
        )}
      </section>

      {/* ── Expert quick actions (only for experts) ── */}
      {user?.user_type === "expert" && (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>Expert Tools</h2>
          </div>
          <div className="dashboard-expert-tools">
            <div className="tool-card" onClick={() => navigate("/mygigs")}>
              <span>📋</span>
              <h3>My Gigs</h3>
              <p>Manage your service listings</p>
            </div>
            <div className="tool-card" onClick={() => navigate("/orders")}>
              <span>📦</span>
              <h3>My Orders</h3>
              <p>View and manage student orders</p>
            </div>
            <div className="tool-card" onClick={() => navigate("/messages")}>
              <span>💬</span>
              <h3>Messages</h3>
              <p>Chat with your students</p>
            </div>
            <div className="tool-card" onClick={() => navigate("/add")}>
              <span>➕</span>
              <h3>Add New Gig</h3>
              <p>Create a new service listing</p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}