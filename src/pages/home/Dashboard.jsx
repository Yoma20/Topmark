// src/pages/home/Dashboard.jsx
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "../../AuthContext";
import newRequest from "../../utils/newRequest";
import GigCard from "../../components/GigCard/GigCard";
import "./Dashboard.scss";

const CATEGORY_IMAGE_MAP = {
  "Law & Legal":                   { icon: "https://cdn.topmark.pro/images/Law & Legal.webp",                      placeholder: "#e8e4f0" },
  "Nursing":                       { icon: "https://cdn.topmark.pro/images/Nursing.webp",                          placeholder: "#e4f0ea" },
  "Cybersecurity":                 { icon: "https://cdn.topmark.pro/images/Cybersecurity.webp",                    placeholder: "#e4eaf0" },
  "Biology":                       { icon: "https://cdn.topmark.pro/images/Biology.webp",                          placeholder: "#e4f0e8" },
  "History":                       { icon: "https://cdn.topmark.pro/images/history.webp",                          placeholder: "#f0ece4" },
  "Data Science":                  { icon: "https://cdn.topmark.pro/images/data science.webp",                     placeholder: "#ede4f0" },
  "Computer Science":              { icon: "https://cdn.topmark.pro/images/computerscience.webp",                  placeholder: "#e4edf0" },
  "Business":                      { icon: "https://cdn.topmark.pro/images/business.webp",                         placeholder: "#f0e4e4" },
  "Psychology":                    { icon: "https://cdn.topmark.pro/images/psychology.webp",                       placeholder: "#f0e8e4" },
  "Essay Writing":                 { icon: "https://cdn.topmark.pro/images/essay.webp",                            placeholder: "#e4f0ec" },
  "Chemistry":                     { icon: "https://cdn.topmark.pro/images/chemistry.webp",                        placeholder: "#e4ecf0" },
  "Mathematics":                   { icon: "https://cdn.topmark.pro/images/maths.webp",                            placeholder: "#ebe4f0" },
  "AI Services":                   { icon: "https://cdn.topmark.pro/images/AI Services.webp",                      placeholder: "#e4f0fb" },
  "Music & Audio":                 { icon: "https://cdn.topmark.pro/images/Music & Audio.webp",                    placeholder: "#f5e4f0" },
  "Writing & Translation":         { icon: "https://cdn.topmark.pro/images/Writing & Translation.webp",            placeholder: "#e4f5ec" },
  "Graphics & Design":             { icon: "https://cdn.topmark.pro/images/Graphics & Design.webp",                placeholder: "#fdf0e4" },
  "Programming & Tech":            { icon: "https://cdn.topmark.pro/images/Programming & Tech.webp",               placeholder: "#e4eaf5" },
  "Consulting":                    { icon: "https://cdn.topmark.pro/images/Consulting.webp",                       placeholder: "#f5f0e4" },
  "Video & Animation":             { icon: "https://cdn.topmark.pro/images/Video & Animation.webp",                placeholder: "#f5e4e4" },
  "Digital Marketing":             { icon: "https://cdn.topmark.pro/images/Digital Marketing.webp",                placeholder: "#e4f5f0" },
  "Data Science & Analytics":      { icon: "https://cdn.topmark.pro/images/Data Science & Analytics.webp",         placeholder: "#ede4f5" },
  "Physics & Engineering":         { icon: "https://cdn.topmark.pro/images/Physics & Engineering.webp",            placeholder: "#e4f0f5" },
  "Technical & Scientific Writing":{ icon: "https://cdn.topmark.pro/images/Technical & Scientific Writing.webp",   placeholder: "#f0f5e4" },
};

const FALLBACK_COLORS = [
  "#e8e4f0","#e4f0ea","#e4eaf0","#e4f0e8",
  "#f0ece4","#ede4f0","#e4edf0","#f0e4e4",
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

// ── Search bar ────────────────────────────────────────────────────────────────
function SearchBar({ categories }) {
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

  const categoryNames = categories.map(c => c.name);

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
    const staticMatches = categoryNames.filter(s =>
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
  }, [categoryNames]); // eslint-disable-line

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
  const filterPills  = [{ id: "", name: "All" }, ...categories];

  // FIXED: pills now navigate to /gigs filtered by category
  function handlePillClick(f) {
    setCategory(f.id === "" ? "" : f.name);
    if (f.id === "") {
      navigate("/gigs");
    } else {
      navigate(`/gigs?category=${encodeURIComponent(f.id)}`);
    }
  }

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
      {/* FIXED: one row, horizontally scrollable, no wrapping */}
      <div className="sb__filters sb__filters--nowrap">
        {filterPills.map(f => (
          <button
            key={f.id}
            className={`sb__filter-pill${category === f.name ? " sb__filter-pill--active" : ""}`}
            onClick={() => handlePillClick(f)}
            type="button"
          >
            {f.name}
          </button>
        ))}
      </div>

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

        {showDropdown && (
          <ul ref={dropRef} className="sb__drop">
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

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    newRequest.get('/gigs/categories/')
      .then(({ data }) => {
        const topLevel = (data?.results ?? data ?? []).filter(c => !c.parent);
        setCategories(topLevel);
      })
      .catch(() => {});
  }, []);

  const { data: gigs, isLoading: gigsLoading } = useQuery({
    queryKey: ["dashboard-gigs"],
    queryFn: () => newRequest.get("/gigs/?sort=sales").then(r => r.data?.results ?? r.data),
  });

  const { data: popularCats, isLoading: catsLoading } = useQuery({
    queryKey: ["popular-categories"],
    queryFn: () =>
      newRequest.get("/gigs/categories/popular/?limit=6").then(r => r.data?.results ?? r.data),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="dashboard">

      <section className="dashboard-search">
        <SearchBar categories={categories} />
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Recommended Experts</h2>
          <span onClick={() => navigate("/gigs")}>See all →</span>
        </div>
        {gigsLoading ? (
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

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Popular Subjects</h2>
          <span onClick={() => navigate("/gigs")}>See all →</span>
        </div>
        {catsLoading ? (
          <div className="dashboard-loading">Loading categories…</div>
        ) : !popularCats?.length ? (
          <div className="dashboard-cats">
            {categories.slice(0, 6).map((cat, idx) => (
              <CategoryCard key={cat.id} cat={cat} idx={idx} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="dashboard-cats">
            {popularCats.map((cat, idx) => (
              <CategoryCard key={cat.id} cat={cat} idx={idx} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, idx, navigate }) {
  const asset = CATEGORY_IMAGE_MAP[cat.name];
  const placeholder = asset?.placeholder || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

  return (
    <div
      className="dashboard-cat"
      onClick={() => navigate(`/gigs?search=${encodeURIComponent(cat.name)}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/gigs?search=${encodeURIComponent(cat.name)}`)}
    >
      <div className="dashboard-cat__img-wrap" style={{ background: placeholder }}>
        {asset?.icon ? (
          <img
            src={asset.icon}
            alt={cat.name}
            loading="lazy"
            className="dashboard-cat__img"
            onLoad={e => e.currentTarget.classList.add("dashboard-cat__img--loaded")}
          />
        ) : (
          <span className="dashboard-cat__letter">{cat.name.charAt(0)}</span>
        )}
        <div className="dashboard-cat__overlay">
          <span className="dashboard-cat__label">{cat.name}</span>
        </div>
      </div>
    </div>
  );
}