import { useState, useRef, useEffect } from "react";
import './gigs.scss';
import GigCard from '../../components/GigCard/GigCard';
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Gigs = () => {
  const [open, setOpen]           = useState(false);
  const [sort, setSort]           = useState("sales");
  const [selectedCat, setSelectedCat] = useState("");
  const [categories, setCategories]   = useState([]);
  const minRef = useRef();
  const maxRef = useRef();
  const { search } = useLocation();
  const navigate   = useNavigate();

  const params       = new URLSearchParams(search);
  const searchQuery  = params.get("search") || "";
  const catFromUrl   = params.get("category") || "";

  // Sync category from URL on load
  useEffect(() => {
    setSelectedCat(catFromUrl);
  }, [catFromUrl]);

  // Fetch categories from backend
  useEffect(() => {
    newRequest.get('/gigs/categories/')
      .then(({ data }) => {
        const topLevel = (data?.results ?? data ?? []).filter(c => !c.parent);
        setCategories(topLevel);
      })
      .catch(() => {});
  }, []);

  // Build query string for API
  const buildQuery = () => {
    const p = new URLSearchParams();
    if (searchQuery)                    p.set('search',   searchQuery);
    if (selectedCat)                    p.set('category', selectedCat);
    if (minRef.current?.value)          p.set('min',      minRef.current.value);
    if (maxRef.current?.value)          p.set('max',      maxRef.current.value);
    p.set('sort', sort);
    return p.toString();
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['gigs', sort, search, selectedCat],
    queryFn: () =>
      newRequest.get(`/gigs/?${buildQuery()}`)
        .then((res) => res.data?.results ?? res.data),
  });

  // When category pill clicked, update URL and state
  const handleCategorySelect = (catId) => {
    setSelectedCat(catId);
    const p = new URLSearchParams();  // start fresh — don't carry over search param
    if (catId) p.set('category', catId);
    navigate(`/gigs?${p.toString()}`, { replace: true });
  };

  const activeCategoryName = categories.find(c => String(c.id) === String(selectedCat))?.name || "";

  const pageTitle = activeCategoryName
    ? `${activeCategoryName} Experts for Hire — Topmark`
    : searchQuery
      ? `${searchQuery} Experts — Topmark`
      : "Browse Academic Experts — Topmark";

  const pageDescription = activeCategoryName
    ? `Find verified ${activeCategoryName} experts on Topmark. Compare packages, read reviews, and get quality help fast.`
    : "Browse hundreds of verified academic experts on Topmark. Tutoring, essay writing, programming, data science and more.";

  return (
    <div className="gigs">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="container">
        
        <button className="gigs-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <h3>Find an Expert</h3>

        {/* ── Category filter pills ── */}
        {categories.length > 0 && (
          <div className="gigs-cats">
            <button
              className={`gigs-cat-pill${!selectedCat ? " gigs-cat-pill--active" : ""}`}
              onClick={() => handleCategorySelect("")}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`gigs-cat-pill${String(selectedCat) === String(cat.id) ? " gigs-cat-pill--active" : ""}`}
                onClick={() => handleCategorySelect(String(cat.id))}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Budget + Sort bar ── */}
        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={() => refetch()}>Apply</button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img
              src="/images/down.png"
              alt="toggle sort options"
              onClick={() => setOpen(!open)}
            />
            {open && (
              <div className="rightMenu">
                {sort === "sales"
                  ? <span onClick={() => { setSort('created_at'); setOpen(false); }}>Newest</span>
                  : <span onClick={() => { setSort('sales'); setOpen(false); }}>Best Selling</span>
                }
              </div>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="cards">
          {isLoading
            ? <div className="loader"></div>
            : error
              ? <h4 style={{ color: "red" }}>Something went wrong</h4>
              : !data?.length
                ? (
                  <div className="gigs-empty">
                    <p>No experts found{activeCategoryName ? ` in ${activeCategoryName}` : searchQuery ? ` for "${searchQuery}"` : ""}.</p>
                    {selectedCat && (
                      <button className="gigs-reset-btn" onClick={() => handleCategorySelect("")}>
                        Clear filter
                      </button>
                    )}
                  </div>
                )
                : data.map((gig) => <GigCard key={gig.slug} item={gig} />)
          }
        </div>
      </div>
    </div>
  );
};

export default Gigs;