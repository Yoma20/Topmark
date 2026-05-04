// src/pages/home/Dashboard.jsx
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "../../AuthContext";
import newRequest from "../../utils/newRequest";
import GigCard from "../../components/GigCard/GigCard";
import "./Dashboard.scss";

const CATEGORIES = [
  { icon: "/images/law.png",             label: "Law & Legal",     search: "Law" },
  { icon: "/images/nursing.png",         label: "Nursing",         search: "Nursing" },
  { icon: "/images/cybersecurity.png",   label: "Cybersecurity",   search: "Cybersecurity" },
  { icon: "/images/biology.png",         label: "Biology",         search: "Biology" },
  { icon: "/images/history.png",         label: "History",         search: "History" },
  { icon: "/images/data-science.png",    label: "Data Science",    search: "Data Science" },
  { icon: "/images/computer-science.png",label: "Computer Science",search: "Computer Science" },
  { icon: "/images/business.png",        label: "Business",        search: "Business" },
  { icon: "/images/psychology.png",      label: "Psychology",      search: "Psychology" },
  { icon: "/images/essay.png",           label: "Essay Writing",   search: "Essay Writing" },
  { icon: "/images/chemistry.png",       label: "Chemistry",       search: "Chemistry" },
  { icon: "/images/mathematics.png",     label: "Mathematics",     search: "Mathematics" },
];

const CATEGORY_COLORS = [
  "#7c3aed","#059669","#2563eb","#16a34a",
  "#d97706","#7c3aed","#0891b2","#dc2626",
  "#7c3aed","#059669","#0891b2","#2563eb",
];

// ── Search bar ────────────────────────────────────────────────────────────────
const STATIC_SUBJECTS = [
  "Law & Legal", "Nursing", "Cybersecurity", "Biology", "History",
  "Data Science", "Computer Science", "Business", "Psychology",
  "Essay Writing", "Chemistry", "Mathematics",
];

const CATEGORY_FILTERS = [
  { label: "All",              value: "" },
  { label: "Law & Legal",      value: "Law" },
  { label: "Nursing",          value: "Nursing" },
  { label: "Computer Science", value: "Computer Science" },
  { label: "Data Science",     value: "Data Science" },
  { label: "Business",         value: "Business" },
  { label: "Mathematics",      value: "Mathematics" },
  { label: "Essay Writing",    value: "Essay Writing" },
  { label: "Chemistry",        value: "Chemistry" },
];

const RECENT_KEY  = "search_recent";
const MAX_RECENT  = 6;
const DEBOUNCE_MS = 300;

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
}
function saveRecent(term) {
  const next = [term, ...loadRecent().filter(t => t !== term)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}
function removeRecent(term) {
  const next = loadRecent().filter(t => t !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

function SearchBar() {
  const navigate = useNavigate();
  const [query,       setQuery]       = useState("");
  const [category,    setCategory]    = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recent,      setRecent]      = useState(loadRecent);
  const [open,        setOpen]        = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const inputRef    = useRef(null);
  const dropRef     = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (term) => {
    const staticMatches = STATIC_SUBJECTS.filter(s =>
      s.toLowerCase().includes(term.toLowerCase())
    );
    setLoading(true);
    try {
      const res = await newRequest.get(`/gigs/?search=${encodeURIComponent(term)}&limit=5`);
      const data = res.data?.results ?? res.data ?? [];
      const apiTitles = [...new Set(data.map(g => g.title).filter(Boolean))].slice(0, 5);
      setSuggestions([
        ...apiTitles,
        ...staticMatches.filter(s => !apiTitles.some(t => t.toLowerCase().includes(s.toLowerCase()))),
      ].slice(0, 8));
    } catch {
      setSuggestions(staticMatches.slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim()) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), DEBOUNCE_MS);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  const showDropdown = open && (loading || suggestions.length > 0 || (!query.trim() && recent.length > 0));
  const dropItems    = query.trim() ? suggestions : recent;

  function goSearch(term = query, cat = category) {
    const q = term.trim();
    if (!q) return;
    setRecent(saveRecent(q));
    setOpen(false);
    setQuery(q);
    navigate(`/gigs?search=${encodeURIComponent(q)}${cat ? `&category=${encodeURIComponent(cat)}` : ""}`);
  }

  function handleKeyDown(e) {
    if (!open) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, dropItems.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); activeIdx >= 0 ? goSearch(dropItems[activeIdx]) : goSearch(); }
    else if (e.key === "Escape") { setOpen(false); setActiveIdx(-1); }
  }

  return (
    <div className="sb">
      {/* Category filter pills */}
      <div className="sb__filters">
        {CATEGORY_FILTERS.map(f => (
          <button
            key={f.value}
            className={`sb__filter-pill${category === f.value ? " sb__filter-pill--active" : ""}`}
            onClick={() => setCategory(f.value)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="sb__bar-wrap">
        <div className="sb__bar">
          <svg className="sb__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            className="sb__input"
            type="text"
            placeholder='Try "nursing care plan" or "law essay APA"'
            value={query}
            autoComplete="off"
            onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="sb__clear" type="button" onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}>✕</button>
          )}
          {loading && <span className="sb__spinner" />}
          <button className="sb__btn" type="button" onClick={() => goSearch()}>Search</button>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <ul ref={dropRef} className="sb__drop">
            {/* Recent searches */}
            {!query.trim() && recent.length > 0 && (
              <>
                <li className="sb__drop-label">
                  <span>Recent searches</span>
                  <button className="sb__drop-clear-all" type="button"
                    onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}>
                    Clear all
                  </button>
                </li>
                {recent.map((term, i) => (
                  <li key={term}
                    className={`sb__drop-item${activeIdx === i ? " sb__drop-item--active" : ""}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseDown={() => goSearch(term)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                    </svg>
                    <span>{term}</span>
                    <button className="sb__drop-remove" type="button"
                      onMouseDown={e => { e.stopPropagation(); setRecent(removeRecent(term)); }}>✕</button>
                  </li>
                ))}
              </>
            )}

            {/* Live suggestions */}
            {query.trim() && (
              <>
                {loading && suggestions.length === 0 && <li className="sb__drop-label">Searching…</li>}
                {suggestions.map((s, i) => {
                  const idx = s.toLowerCase().indexOf(query.toLowerCase());
                  return (
                    <li key={s}
                      className={`sb__drop-item${activeIdx === i ? " sb__drop-item--active" : ""}`}
                      onMouseEnter={() => setActiveIdx(i)}
                      onMouseDown={() => goSearch(s)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <span>
                        {idx >= 0
                          ? <>{s.slice(0, idx)}<strong>{s.slice(idx, idx + query.length)}</strong>{s.slice(idx + query.length)}</>
                          : s}
                      </span>
                    </li>
                  );
                })}
                {!loading && suggestions.length === 0 && <li className="sb__drop-label">No suggestions found</li>}
              </>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Profile menu ──────────────────────────────────────────────────────────────
function ProfileMenu({ user, navigate, activeOrders, unreadData }) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: "person-outline",      label: "Profile",  path: "/profile" },
    {
      icon: "chatbox-outline",
      label: unreadData?.unread_count > 0 ? `Messages (${unreadData.unread_count})` : "Messages",
      path: "/messages",
    },
    {
      icon: "notifications-outline",
      label: activeOrders.length > 0 ? `Orders (${activeOrders.length})` : "Orders",
      path: "/orders",
    },
    { icon: "cog-outline",     label: "Settings", path: "/settings" },
    { icon: "log-out-outline", label: "Logout",   path: "/logout" },
  ];

  return (
    <div className={`dash-nav${open ? " dash-nav--open" : ""}`}>
      <div className="dash-nav__user-box">
        <div className="dash-nav__avatar">
          <img src={user?.img || "/images/noavatar.jpeg"} alt={user?.username} />
        </div>
        <span className="dash-nav__username">{user?.username}</span>
      </div>

      <div className="dash-nav__toggle" onClick={() => setOpen(o => !o)} />

      <ul className="dash-nav__menu">
        {menuItems.map(item => (
          <li key={item.label}>
            <a href="#" onClick={e => { e.preventDefault(); setOpen(false); navigate(item.path); }}>
              <ion-icon name={item.icon} />
              {item.label}
            </a>
          </li>
        ))}
        {user?.user_type === "expert" && (
          <li>
            <a href="#" onClick={e => { e.preventDefault(); setOpen(false); navigate("/add"); }}>
              <ion-icon name="add-circle-outline" />
              Add New Gig
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const { data: gigs, isLoading } = useQuery({
    queryKey: ["dashboard-gigs"],
    queryFn: () => newRequest.get("/gigs/?sort=sales").then(r => r.data?.results ?? r.data),
  });

  const { data: orders } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: () => newRequest.get("/gigs/orders/").then(r => r.data?.results ?? r.data),
    enabled: !!user,
  });

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

      <ProfileMenu
        user={user}
        navigate={navigate}
        activeOrders={activeOrders}
        unreadData={unreadData}
      />

      {/* ── Welcome banner ── */}
      <section className="dashboard-welcome">
        <div className="dashboard-welcome__inner">
          <div>
            <h1>Welcome back, <span>{user?.username}</span> 👋</h1>
            <p>Find a verified expert for your next assignment</p>
          </div>
        </div>
      </section>

      {/* ── Quick search ── */}
      <section className="dashboard-search">
        <SearchBar />
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
                <img src={cat.icon} alt={cat.label} style={{ width: "32px", height: "32px", objectFit: "contain" }} />
              </div>
              <span className="dashboard-cat__label">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Active orders ── */}
      {activeOrders.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>Your Active Orders</h2>
            <span onClick={() => navigate("/orders")}>View all →</span>
          </div>
          <div className="dashboard-orders">
            {activeOrders.slice(0, 3).map(order => (
              <div key={order.id} className="dashboard-order-card">
                <img src={order.gig_cover || "/images/noavatar.jpeg"} alt={order.gig_title} />
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

      {/* ── Expert tools ── */}
      {user?.user_type === "expert" && (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>Expert Tools</h2>
          </div>
          <div className="dashboard-expert-tools">
            <div className="tool-card" onClick={() => navigate("/mygigs")}>
              <img src="/images/gigs.png" alt="manage your gigs" style={{ width: "36px", height: "36px" }} />
              <h3>My Gigs</h3>
              <p>Manage your service listings</p>
            </div>
            <div className="tool-card" onClick={() => navigate("/orders")}>
              <img src="/images/orders.png" alt="orders" style={{ width: "36px", height: "36px" }} />
              <h3>My Orders</h3>
              <p>View and manage student orders</p>
            </div>
            <div className="tool-card" onClick={() => navigate("/messages")}>
              <img src="/images/messages.png" alt="chat" style={{ width: "36px", height: "36px" }} />
              <h3>Messages</h3>
              <p>Chat with your students</p>
            </div>
            <div className="tool-card" onClick={() => navigate("/add")}>
              <img src="/images/gig.png" alt="add new gig" style={{ width: "36px", height: "36px" }} />
              <h3>Add New Gig</h3>
              <p>Create a new service listing</p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}