import { Link, useNavigate } from "react-router-dom";
import "./myGigs.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../../AuthContext";

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function NavItem({ label, active, to, onClick }) {
  const content = (
    <div className={`mg-nav-item ${active ? "mg-nav-item--active" : ""}`} onClick={onClick}>
      <span className="mg-nav-item__label">{label}</span>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: "none" }}>{content}</Link> : content;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon, trend }) {
  return (
    <div className={`mg-stat ${accent ? "mg-stat--accent" : ""}`}>
      <div className="mg-stat__top">
        <span className="mg-stat__icon">{icon}</span>
        {trend !== undefined && (
          <span className={`mg-stat__trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <span className="mg-stat__value">{value}</span>
      <span className="mg-stat__label">{label}</span>
      {sub && <span className="mg-stat__sub">{sub}</span>}
    </div>
  );
}

// ─── Mini bar chart (CSS-only, like the trading analytics widget) ─────────────
function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="mg-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="mg-bar-chart__col">
          <div
            className="mg-bar-chart__bar"
            style={{ height: `${(d.value / max) * 100}%` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="mg-bar-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="mg-empty">
      <h2>No gigs yet</h2>
      <p>Create your first gig and start receiving orders from students.</p>
      <Link to="/add">
        <button className="mg-btn mg-btn--primary mg-btn--lg">+ Create Your First Gig</button>
      </Link>
    </div>
  );
}

// ─── Availability toggle ──────────────────────────────────────────────────────
function AvailabilityToggle({ available, onChange, loading }) {
  return (
    <button
      className={`mg-avail-toggle ${available ? "mg-avail-toggle--on" : "mg-avail-toggle--off"}`}
      onClick={onChange}
      disabled={loading}
      title={available ? "You are visible to students — click to go offline" : "You are hidden — click to go online"}
    >
      <span className="mg-avail-toggle__dot" />
      <span>{loading ? "Updating…" : available ? "Available" : "Offline"}</span>
    </button>
  );
}

// ─── Gig row ──────────────────────────────────────────────────────────────────
function GigRow({ gig, index, onDelete, onTogglePause }) {
  return (
    <tr style={{ animationDelay: `${index * 0.05}s` }}>
      <td>
        <img
          className="mg-cover"
          src={gig.cover_image || "/images/noavatar.jpeg"}
          alt={gig.title}
        />
      </td>
      <td>
        <Link to={`/gig/${gig.slug}`} className="mg-title-link">
          {gig.title}
        </Link>
        {gig.category_name && (
          <span className="mg-category">{gig.category_name}</span>
        )}
      </td>
      <td className="mg-price">${gig.starting_price ?? "—"}</td>
      <td>{gig.sales ?? 0}</td>
      <td>
        <span
          className={`mg-badge ${
            gig.is_active !== false ? "mg-badge--active" : "mg-badge--inactive"
          }`}
        >
          {gig.is_active !== false ? "Active" : "Paused"}
        </span>
      </td>
      <td>
        <div className="mg-actions">
          <Link to={`/gig/${gig.slug}`}>
            <button className="mg-icon-btn" title="View gig"></button>
          </Link>
          <Link to={`/edit-gig/${gig.slug}`}>
            <button className="mg-icon-btn" title="Edit gig"></button>
          </Link>
          <button
            className="mg-icon-btn mg-icon-btn--pause"
            title={gig.is_active !== false ? "Pause gig" : "Resume gig"}
            onClick={() => onTogglePause(gig)}
          >
            {gig.is_active !== false ? "" : ""}
          </button>
          <button
            className="mg-icon-btn mg-icon-btn--danger"
            title="Delete gig"
            onClick={() => onDelete(gig.slug)}
          >
            
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Delete confirm modal ──────────────────────────────────────────────────────
function ConfirmModal({ gigSlug, onConfirm, onCancel, isPending }) {
  return (
    <div className="mg-modal-backdrop" onClick={onCancel}>
      <div className="mg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mg-modal__icon"></div>
        <h3>Delete this gig?</h3>
        <p>
          This action cannot be undone. Any active orders on this gig may be
          affected.
        </p>
        <div className="mg-modal__actions">
          <button className="mg-btn mg-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="mg-btn mg-btn--danger"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function MyGigs() {
  const { user: currentUser, login } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("gigs");
  const [confirmSlug, setConfirmSlug] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type }

  // Role guard
  useEffect(() => {
    if (!currentUser || currentUser.user_type !== "expert") navigate("/");
  }, [currentUser, navigate]);

  // ── Fetch gigs ─────────────────────────────────────────────────────────────
  const {
    isLoading,
    error,
    data: gigs,
  } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () =>
      newRequest.get("/gigs/mine/").then((res) => res.data?.results ?? res.data),
    enabled: !!currentUser,
  });

  // ── Fetch expert profile (for availability toggle + avatar) ────────────────
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["expertProfileMe"],
    queryFn: () =>
      newRequest.get("/expert-profiles/me/").then((res) => res.data),
    enabled: !!currentUser,
  });

  // ── Delete gig ─────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (slug) => newRequest.delete(`/gigs/${slug}/manage/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      setConfirmSlug(null);
      showToast("Gig deleted successfully.", "success");
    },
    onError: () => showToast("Failed to delete gig.", "error"),
  });

  // ── Toggle gig active/paused (PATCH /gigs/<slug>/manage/) ─────────────────
  // NOTE: your GigUpdateDeleteView must accept PATCH with { is_active }
  const pauseMutation = useMutation({
    mutationFn: ({ slug, is_active }) =>
      newRequest.patch(`/gigs/${slug}/manage/`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      showToast("Gig status updated.", "success");
    },
    onError: () => showToast("Could not update gig status.", "error"),
  });

  // ── Toggle availability on ExpertProfile ──────────────────────────────────
  const toggleAvailability = async () => {
    if (!profile) return;
    setAvailLoading(true);
    try {
      await newRequest.patch("/expert-profiles/me/", {
        available: !profile.available,
      });
      await refetchProfile();
      showToast(
        !profile.available
          ? "You are now visible to students."
          : "You are now offline.",
        "success"
      );
    } catch {
      showToast("Could not update availability.", "error");
    } finally {
      setAvailLoading(false);
    }
  };

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalSales = gigs?.reduce((s, g) => s + (g.sales || 0), 0) ?? 0;
  const totalEarnings = gigs?.reduce(
    (s, g) => s + (g.sales || 0) * (g.starting_price || 0),
    0
  ) ?? 0;
  const activeGigsCount = gigs?.filter((g) => g.is_active !== false).length ?? 0;
  const avgRating = gigs?.length
    ? (
        gigs.reduce((s, g) => s + (parseFloat(g.expert_rating) || 0), 0) /
        gigs.length
      ).toFixed(1)
    : "—";

  // Bar chart data: sales per gig (top 6)
  const chartData = (gigs ?? [])
    .slice(0, 6)
    .map((g) => ({ label: g.short_title || g.title.slice(0, 8), value: g.sales || 0 }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="myGigs">
      {/* Toast */}
      {toast && (
        <div className={`mg-toast mg-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Delete modal */}
      {confirmSlug && (
        <ConfirmModal
          gigSlug={confirmSlug}
          isPending={deleteMutation.isPending}
          onCancel={() => setConfirmSlug(null)}
          onConfirm={() => deleteMutation.mutate(confirmSlug)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="mg-sidebar">
        
        

        
        
          
            
            
            
          
          
        

        

        {/* Nav */}
        <nav className="mg-sidebar__nav">
          
          <NavItem label="Orders"   active={activeNav === "orders"}   onClick={() => setActiveNav("orders")}   to="/orders" />
          <NavItem label="Messages"  active={activeNav === "messages"}  onClick={() => setActiveNav("messages")}  to="/messages" />
          <NavItem label="Profile"   active={activeNav === "profile"}   onClick={() => setActiveNav("profile")}   to="/profile" />
          <NavItem label="Earnings"  active={activeNav === "earnings"}  onClick={() => setActiveNav("earnings")}  to="/earnings" />
        </nav>

        {/* Quick link */}
        <div className="mg-sidebar__footer">
          <Link to="/add">
            <button className="mg-btn mg-btn--primary mg-btn--full">
              + New Gig
            </button>
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="mg-main">
        {/* Page header */}
        <div className="mg-header">
          <div>
            <h1>My Gigs</h1>
            <p className="mg-header__sub">
              Welcome back,{" "}
              <strong>{currentUser?.username}</strong>
            </p>
          </div>
          <div className="mg-header__actions">
            <Link to="/profile">
              <button className="mg-btn mg-btn--ghost">Edit Profile</button>
            </Link>
            <Link to="/add">
              <button className="mg-btn mg-btn--primary">+ New Gig</button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mg-stats">
          <StatCard
            label="Active Gigs"
            value={activeGigsCount}
            sub={`of ${gigs?.length ?? 0} total`}
          />
          <StatCard
            label="Total Sales"
            value={totalSales}
            sub="all time"
          />
          <StatCard
            label="Est. Earnings"
            value={`$${totalEarnings.toLocaleString()}`}
            sub="based on starting price"
            accent
          />
          <StatCard
            label="Avg. Rating"
            value={avgRating}
            sub="across all gigs"
          />
        </div>

        {isLoading ? (
          <div className="mg-loading">
            <div className="mg-spinner" />
            <span>Loading your gigs…</span>
          </div>
        ) : error ? (
          <div className="mg-error">
            
            <p>Something went wrong loading your gigs.</p>
            <button onClick={() => queryClient.invalidateQueries(["myGigs"])}>
              Retry
            </button>
          </div>
        ) : !gigs?.length ? (
          <EmptyState />
        ) : (
          <>
            {/* ── Widget row ── */}
            <div className="mg-widgets">
              {/* Sales by gig bar chart */}
              <div className="mg-widget">
                <div className="mg-widget__header">
                  <h3>Sales by Gig</h3>
                  <span className="mg-widget__badge">Last activity</span>
                </div>
                {chartData.some((d) => d.value > 0) ? (
                  <MiniBarChart data={chartData} />
                ) : (
                  <div className="mg-widget__empty">No sales data yet</div>
                )}
              </div>

              {/* Profile completeness */}
              <div className="mg-widget">
                <div className="mg-widget__header">
                  <h3>Profile Strength</h3>
                </div>
                <div className="mg-profile-checks">
                  {[
                    { label: "Avatar set", done: !!profile?.avatar_url },
                    { label: "Bio written", done: !!profile?.bio },
                    { label: "Skills added", done: (profile?.skills?.length ?? 0) > 0 },
                    { label: "First gig created", done: (gigs?.length ?? 0) > 0 },
                    {
                      label: "Stripe connected",
                      done: !!profile?.stripe_account_verified,
                    },
                  ].map((c, i) => (
                    <div key={i} className={`mg-check ${c.done ? "mg-check--done" : ""}`}>
                      <span>{c.done ? "" : "○"}</span>
                      {c.label}
                    </div>
                  ))}
                  <div className="mg-profile-bar">
                    <div
                      className="mg-profile-bar__fill"
                      style={{
                        width: `${
                          ([
                            !!profile?.avatar_url,
                            !!profile?.bio,
                            (profile?.skills?.length ?? 0) > 0,
                            (gigs?.length ?? 0) > 0,
                            !!profile?.stripe_account_verified,
                          ].filter(Boolean).length /
                            5) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Gigs table ── */}
            <div className="mg-table-wrap">
              <div className="mg-table-header">
                <span className="mg-table-title">All Gigs</span>
                <span className="mg-table-count">{gigs.length} gig{gigs.length !== 1 ? "s" : ""}</span>
              </div>
              <table className="mg-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Starting Price</th>
                    <th>Sales</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gigs.map((gig, i) => (
                    <GigRow
                      key={gig.slug}
                      gig={gig}
                      index={i}
                      onDelete={(slug) => setConfirmSlug(slug)}
                      onTogglePause={(g) =>
                        pauseMutation.mutate({
                          slug: g.slug,
                          is_active: !g.is_active,
                        })
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mg-footer-bar">
              <span>{gigs.length} gig{gigs.length !== 1 ? "s" : ""} total</span>
              <Link to="/orders" className="mg-link">
                View all orders →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MyGigs;