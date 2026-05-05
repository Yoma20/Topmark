import { Link, useNavigate } from "react-router-dom";
import "./myGigs.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useState } from "react";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`mg-stat ${accent ? 'mg-stat--accent' : ''}`}>
      <span className="mg-stat__value">{value}</span>
      <span className="mg-stat__label">{label}</span>
      {sub && <span className="mg-stat__sub">{sub}</span>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mg-empty">
      <div className="mg-empty__icon">📭</div>
      <h2>No gigs yet</h2>
      <p>Create your first gig and start receiving orders from students.</p>
      <Link to="/add">
        <button className="mg-btn mg-btn--primary mg-btn--lg">
          + Create Your First Gig
        </button>
      </Link>
    </div>
  );
}

function MyGigs() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null); // id of gig pending delete confirm

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () =>
      newRequest.get(`/gigs/mine/`).then((res) => res.data?.results ?? res.data),
  });

  const mutation = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}/manage/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      setConfirmId(null);
    },
  });

  // ── Derived stats ───────────────────────────────────────────────────────
  const totalSales    = data?.reduce((sum, g) => sum + (g.sales || 0), 0) ?? 0;
  const totalEarnings = data?.reduce((sum, g) => sum + ((g.sales || 0) * (g.starting_price || 0)), 0) ?? 0;
  const activeGigs    = data?.length ?? 0;
  const avgRating     = data?.length
    ? (data.reduce((sum, g) => sum + (parseFloat(g.expert_rating) || 0), 0) / data.length).toFixed(1)
    : '—';

  // ── Loading / error ─────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="myGigs">
      <div className="mg-loading">
        <div className="mg-spinner" />
        <span>Loading your gigs…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="myGigs">
      <div className="mg-error">
        <span>⚠️</span>
        <p>Something went wrong loading your gigs.</p>
        <button onClick={() => queryClient.invalidateQueries(["myGigs"])}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="myGigs">
      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="mg-modal-backdrop" onClick={() => setConfirmId(null)}>
          <div className="mg-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete this gig?</h3>
            <p>This action cannot be undone. Any active orders on this gig may be affected.</p>
            <div className="mg-modal__actions">
              <button className="mg-btn mg-btn--ghost" onClick={() => setConfirmId(null)}>
                Cancel
              </button>
              <button
                className="mg-btn mg-btn--danger"
                disabled={mutation.isLoading}
                onClick={() => mutation.mutate(confirmId)}
              >
                {mutation.isLoading ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mg-container">

        {/* ── Header ── */}
        <div className="mg-header">
          <div>
            <h1>My Gigs</h1>
            <p className="mg-header__sub">
              Welcome back, <strong>{currentUser?.username}</strong>
            </p>
          </div>
          {currentUser?.user_type === 'expert' && (
            <div className="mg-header__actions">
              <Link to="/profile">
                <button className="mg-btn mg-btn--ghost">Edit Profile</button>
              </Link>
              <Link to="/add">
                <button className="mg-btn mg-btn--primary">+ New Gig</button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="mg-stats">
          <StatCard label="Active Gigs"    value={activeGigs} />
          <StatCard label="Total Sales"    value={totalSales} />
          <StatCard
            label="Est. Earnings"
            value={`$${totalEarnings.toLocaleString()}`}
            sub="based on starting price"
            accent
          />
          <StatCard label="Avg. Rating" value={avgRating} sub="across all gigs" />
        </div>

        {/* ── Empty state or table ── */}
        {!data?.length ? <EmptyState /> : (
          <>
            <div className="mg-table-wrap">
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
                  {data.map((gig, i) => (
                    <tr key={gig.id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <td>
                        <img
                          className="mg-cover"
                          src={gig.cover_image || '/images/noavatar.jpeg'}
                          alt={gig.title}
                        />
                      </td>
                      <td>
                        <Link to={`/gig/${gig.id}`} className="mg-title-link">
                          {gig.title}
                        </Link>
                        {gig.category_name && (
                          <span className="mg-category">{gig.category_name}</span>
                        )}
                      </td>
                      <td className="mg-price">${gig.starting_price ?? '—'}</td>
                      <td>{gig.sales ?? 0}</td>
                      <td>
                        <span className={`mg-badge ${gig.is_active !== false ? 'mg-badge--active' : 'mg-badge--inactive'}`}>
                          {gig.is_active !== false ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td>
                        <div className="mg-actions">
                          <Link to={`/gig/${gig.id}`}>
                            <button className="mg-icon-btn" title="View gig">👁</button>
                          </Link>
                          <Link to={`/edit-gig/${gig.id}`}>
                            <button className="mg-icon-btn" title="Edit gig">✏️</button>
                          </Link>
                          <button
                            className="mg-icon-btn mg-icon-btn--danger"
                            title="Delete gig"
                            onClick={() => setConfirmId(gig.id)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick link to orders */}
            <div className="mg-footer-bar">
              <span>{data.length} gig{data.length !== 1 ? 's' : ''} total</span>
              <Link to="/orders" className="mg-link">View all orders →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyGigs;