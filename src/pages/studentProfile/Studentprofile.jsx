import { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import AuthContext from "../../AuthContext";
import newRequest from "../../utils/newRequest";
import "./studentProfile.scss";

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NAV = [
  { key: "overview",  label: "Overview"         },
  { key: "messages",  label: "Messages",          to: "/messages"   },
  { key: "orders",    label: "My Orders"         },
  { key: "settings",  label: "Account Settings"  },
  { key: "password",  label: "Change Password"   },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
function OrderBadge({ status }) {
  const map = {
    pending:     "sp-badge sp-badge--pending",
    in_progress: "sp-badge sp-badge--progress",
    submitted:   "sp-badge sp-badge--submitted",
    completed:   "sp-badge sp-badge--done",
    archived:    "sp-badge sp-badge--archived",
  };
  const labels = {
    pending: "Pending", in_progress: "In Progress",
    submitted: "Submitted", completed: "Completed", archived: "Archived",
  };
  return (
    <span className={map[status] || "sp-badge"}>
      {labels[status] || status}
    </span>
  );
}

// ─── Avatar upload button ─────────────────────────────────────────────────────
function AvatarUpload({ current, onUpload, uploading }) {
  const ref = useRef();
  return (
    <div className="sp-avatar-wrap">
      <img
        src={current || "/images/noavatar.jpeg"}
        alt="avatar"
        className="sp-avatar"
      />
      <button
        className="sp-avatar-btn"
        onClick={() => ref.current.click()}
        disabled={uploading}
        title="Change photo"
      >
        {uploading ? "…" : "Edit"}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
      />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`sp-toast sp-toast--${toast.type}`}>{toast.msg}</div>
  );
}

// ─── Overview panel ───────────────────────────────────────────────────────────
function Overview({ me, orders }) {
  const totalOrders   = orders?.length ?? 0;
  const activeOrders  = orders?.filter(o => ["pending","in_progress","submitted"].includes(o.status)).length ?? 0;
  const doneOrders    = orders?.filter(o => o.status === "completed").length ?? 0;
  const totalSpent    = orders?.filter(o => o.status === "completed")
                               .reduce((s, o) => s + parseFloat(o.total_price || 0), 0) ?? 0;

  return (
    <div className="sp-panel">
      <h2 className="sp-panel__title">Overview</h2>

      <div className="sp-stats">
        <div className="sp-stat">
          <span className="sp-stat__value">{totalOrders}</span>
          <span className="sp-stat__label">Total Orders</span>
        </div>
        <div className="sp-stat">
          <span className="sp-stat__value">{activeOrders}</span>
          <span className="sp-stat__label">Active</span>
        </div>
        <div className="sp-stat sp-stat--accent">
          <span className="sp-stat__value">{doneOrders}</span>
          <span className="sp-stat__label">Completed</span>
        </div>
        <div className="sp-stat">
          <span className="sp-stat__value">${totalSpent.toFixed(2)}</span>
          <span className="sp-stat__label">Total Spent</span>
        </div>
      </div>

      <div className="sp-section-title">Recent Orders</div>
      {!orders?.length ? (
        <div className="sp-empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/gigs"><button className="sp-btn sp-btn--primary">Browse Experts</button></Link>
        </div>
      ) : (
        <div className="sp-orders-list">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="sp-order-row">
              <img
                src={order.gig_cover || "/images/noavatar.jpeg"}
                className="sp-order-cover"
                alt=""
              />
              <div className="sp-order-info">
                <span className="sp-order-title">{order.gig_title}</span>
                <span className="sp-order-expert">by {order.expert_username}</span>
              </div>
              <div className="sp-order-meta">
                <OrderBadge status={order.status} />
                <span className="sp-order-price">${order.total_price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Orders panel ─────────────────────────────────────────────────────────────
function Orders({ orders, isLoading }) {
  const [filter, setFilter] = useState("all");
  const filters = ["all","pending","in_progress","submitted","completed","archived"];
  const filtered = filter === "all" ? orders : orders?.filter(o => o.status === filter);

  return (
    <div className="sp-panel">
      <h2 className="sp-panel__title">My Orders</h2>

      <div className="sp-filter-row">
        {filters.map(f => (
          <button
            key={f}
            className={`sp-filter-btn ${filter === f ? "sp-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="sp-loading"><div className="sp-spinner" /></div>
      ) : !filtered?.length ? (
        <div className="sp-empty"><p>No orders in this category.</p></div>
      ) : (
        <div className="sp-table-wrap">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Gig</th>
                <th>Expert</th>
                <th>Package</th>
                <th>Total</th>
                <th>Deadline</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <tr key={order.id} style={{ animationDelay: `${i * 0.04}s` }}>
                  <td>
                    <div className="sp-gig-cell">
                      <img src={order.gig_cover || "/images/noavatar.jpeg"} className="sp-order-cover" alt="" />
                      <span>{order.gig_title}</span>
                    </div>
                  </td>
                  <td>{order.expert_username}</td>
                  <td>{order.package?.tier}</td>
                  <td className="sp-mono">${order.total_price}</td>
                  <td className="sp-mono">
                    {order.deadline
                      ? new Date(order.deadline).toLocaleDateString()
                      : "—"}
                  </td>
                  <td><OrderBadge status={order.status} /></td>
                  <td>
                    <Link to={`/orders/${order.id}`}>
                      <button className="sp-btn sp-btn--sm sp-btn--ghost">View</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────
function Settings({ me, onSave, saving, onAvatarUpload, uploading }) {
  const [form, setForm] = useState({
    username:   me?.username   || "",
    email:      me?.email      || "",
    first_name: me?.first_name || "",
    last_name:  me?.last_name  || "",
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="sp-panel">
      <h2 className="sp-panel__title">Account Settings</h2>

      <div className="sp-settings-avatar">
        <AvatarUpload
          current={me?.profile_picture}
          onUpload={onAvatarUpload}
          uploading={uploading}
        />
        <div>
          <div className="sp-settings-name">{me?.username}</div>
          <div className="sp-settings-email">{me?.email}</div>
        </div>
      </div>

      <div className="sp-form">
        <div className="sp-form-row">
          <div className="sp-field">
            <label>First Name</label>
            <input value={form.first_name} onChange={set("first_name")} placeholder="First name" />
          </div>
          <div className="sp-field">
            <label>Last Name</label>
            <input value={form.last_name} onChange={set("last_name")} placeholder="Last name" />
          </div>
        </div>
        <div className="sp-field">
          <label>Username</label>
          <input value={form.username} onChange={set("username")} placeholder="username" />
        </div>
        <div className="sp-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
        </div>
        <button
          className="sp-btn sp-btn--primary"
          disabled={saving}
          onClick={() => onSave(form)}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Password panel ───────────────────────────────────────────────────────────
function ChangePassword({ onSave, saving }) {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [show, setShow] = useState({ cur: false, nw: false, conf: false });
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const tog = (k) => () => setShow(s => ({ ...s, [k]: !s[k] }));

  const submit = () => {
    if (form.new_password !== form.confirm) { setErr("Passwords don't match."); return; }
    if (form.new_password.length < 8)       { setErr("Minimum 8 characters."); return; }
    setErr("");
    onSave({ current_password: form.current_password, new_password: form.new_password });
  };

  return (
    <div className="sp-panel">
      <h2 className="sp-panel__title">Change Password</h2>
      <div className="sp-form sp-form--narrow">
        {[
          { label: "Current Password", key: "current_password", showKey: "cur" },
          { label: "New Password",     key: "new_password",     showKey: "nw"  },
          { label: "Confirm Password", key: "confirm",          showKey: "conf"},
        ].map(({ label, key, showKey }) => (
          <div className="sp-field" key={key}>
            <label>{label}</label>
            <div className="sp-pw-wrap">
              <input
                type={show[showKey] ? "text" : "password"}
                value={form[key]}
                onChange={set(key)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="sp-eye"
                onClick={tog(showKey)}
                tabIndex={-1}
              >
                {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        ))}
        {err && <div className="sp-field-error">{err}</div>}
        <button className="sp-btn sp-btn--primary" disabled={saving} onClick={submit}>
          {saving ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const { user: currentUser, login } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate    = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch /api/users/me/ ───────────────────────────────────────────────────
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => newRequest.get("/users/me/").then(r => r.data),
    enabled: !!currentUser,
  });

  // ── Fetch student orders from /api/gigs/orders/ ────────────────────────────
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["studentOrders"],
    queryFn: () => newRequest.get("/gigs/orders/").then(r => r.data?.results ?? r.data),
    enabled: !!currentUser,
  });

  // ── PATCH /api/users/me/ ───────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const saveProfile = async (form) => {
    setSaving(true);
    try {
      const res = await newRequest.patch("/users/me/", form);
      login({ ...currentUser, ...res.data });
      queryClient.invalidateQueries(["me"]);
      showToast("Profile updated.");
    } catch (err) {
      const msg = err?.response?.data;
      const text = typeof msg === "object"
        ? Object.values(msg).flat().join(" ")
        : "Failed to update profile.";
      showToast(text, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload — PATCH /api/users/me/ with multipart ───────────────────
  const [uploading, setUploading] = useState(false);
  const uploadAvatar = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("profile_picture", file);
    try {
      const res = await newRequest.patch("/users/me/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      login({ ...currentUser, profile_picture: res.data.profile_picture });
      queryClient.invalidateQueries(["me"]);
      showToast("Photo updated.");
    } catch {
      showToast("Photo upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  // ── POST /api/users/change-password/ ──────────────────────────────────────
  const [pwSaving, setPwSaving] = useState(false);
  const changePassword = async (data) => {
    setPwSaving(true);
    try {
      const res = await newRequest.post("/users/change-password/", data);
      login({ ...currentUser, token: res.data.token });
      showToast("Password changed successfully.");
    } catch (err) {
      const msg = err?.response?.data;
      const text = typeof msg === "object"
        ? Object.values(msg).flat().join(" ")
        : "Password change failed.";
      showToast(text, "error");
    } finally {
      setPwSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="sp-gate">
        <p>Please <Link to="/login">log in</Link> to view your profile.</p>
      </div>
    );
  }

  if (currentUser.user_type === "expert") {
    return (
      <div className="sp-gate">
        <p>This page is for student accounts. <Link to="/expert-dashboard">Go to your dashboard →</Link></p>
      </div>
    );
  }

  return (
    <div className="studentProfile">
      <Toast toast={toast} />

      {/* ── Sidebar ── */}
      <aside className="sp-sidebar">
        <div className="sp-sidebar__top">
          <img
            src={me?.profile_picture || "/images/noavatar.jpeg"}
            className="sp-sidebar__avatar"
            alt="avatar"
          />
          <div className="sp-sidebar__name">
            {me?.first_name
              ? `${me.first_name} ${me.last_name || ""}`.trim()
              : me?.username || currentUser.username}
          </div>
          <div className="sp-sidebar__tag">Student</div>
        </div>

        <nav className="sp-sidebar__nav">
          {NAV.map(({ key, label, to }) =>
            to ? (
              <Link to={to} key={key} style={{ textDecoration: "none" }}>
                <button className="sp-nav-btn">{label}</button>
              </Link>
            ) : (
              <button
                key={key}
                className={`sp-nav-btn ${activeNav === key ? "sp-nav-btn--active" : ""}`}
                onClick={() => setActiveNav(key)}
              >
                {activeNav === key && <span className="sp-nav-btn__bar" />}
                {label}
              </button>
            )
          )}
        </nav>

        <div className="sp-sidebar__bottom">
          <Link to="/gigs">
            <button className="sp-btn sp-btn--primary sp-btn--full">Browse Experts</button>
          </Link>
          <Link to="/orders">
            <button className="sp-btn sp-btn--ghost sp-btn--full">View All Orders</button>
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="sp-main">
        {activeNav === "overview" && (
          <Overview me={me} orders={orders} />
        )}
        {activeNav === "orders" && (
          <Orders orders={orders} isLoading={ordersLoading} />
        )}
        {activeNav === "settings" && (
          <Settings
            me={me}
            onSave={saveProfile}
            saving={saving}
            onAvatarUpload={uploadAvatar}
            uploading={uploading}
          />
        )}
        {activeNav === "password" && (
          <ChangePassword onSave={changePassword} saving={pwSaving} />
        )}
      </main>
    </div>
  );
}