import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ContactDrawer from "../../components/messaging/ContactDrawer";
import AuthContext from "../../AuthContext";
import "./Gig.scss";

/* ─── Star Rating ──────────────────────────────────────────── */
const StarRating = ({ rating, reviewCount }) => {
  const value = parseFloat(rating);
  if (!value) return <span className="rating-new">New</span>;
  const full = Math.round(value);
  return (
    <div className="stars">
      {Array(5).fill(null).map((_, i) => (
        <svg key={i} className={`star-icon ${i < full ? "filled" : "empty"}`} viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="rating-value">{value.toFixed(1)}</span>
      {reviewCount != null && <span className="rating-count">({reviewCount})</span>}
    </div>
  );
};

/* ─── Image Gallery (Fiverr-style with thumbnails) ─────────── */
const ImageGallery = ({ images, title }) => {
  const [active, setActive] = useState(0);
  if (!images?.length) return null;
  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={images[active]} alt={`${title} — sample ${active + 1}`} />
        {images.length > 1 && (
          <>
            <button className="gallery__arrow gallery__arrow--prev" onClick={() => setActive(i => (i - 1 + images.length) % images.length)}>‹</button>
            <button className="gallery__arrow gallery__arrow--next" onClick={() => setActive(i => (i + 1) % images.length)}>›</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery__thumbs">
          {images.map((img, i) => (
            <button key={i} className={`gallery__thumb ${i === active ? "active" : ""}`} onClick={() => setActive(i)}>
              <img src={img} alt={`thumb ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Gig Page ─────────────────────────────────────────────── */
const Gig = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);  // ← session-based, not localStorage
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [whatsIncludedOpen, setWhatsIncludedOpen] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig", slug],
    queryFn: () => newRequest.get(`/gigs/${slug}/`).then((res) => res.data),
  });

  useEffect(() => {
    if (data?.packages?.length) setSelectedPackage(data.packages[0]);
  }, [data]);

  if (isLoading) return <div className="gig-loader"><div className="spinner" /></div>;
  if (error) return <div className="gig-error">Something went wrong loading this gig.</div>;

  // Merge cover_image + extra images array so gallery always has something to show
  const allImages = [
    ...(data.cover_image ? [data.cover_image] : []),
    ...(data.images || []).filter(img => img !== data.cover_image),
  ];

  const pageTitle = data.title
    ? `${data.title} by ${data.expert_username} — Topmark`
    : "Expert Service — Topmark";
  const pageDescription = data.description?.slice(0, 155) ?? `Hire ${data.expert_username} on Topmark.`;
  const lowestPrice = data.packages?.length ? Math.min(...data.packages.map(p => p.price)) : null;
  const isOwner = currentUser && currentUser.user_id === data.expert_user_id;

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: data.title,
    description: data.description,
    provider: { "@type": "Person", name: data.expert_username },
    ...(lowestPrice && { offers: { "@type": "Offer", priceCurrency: "USD", price: lowestPrice, availability: "https://schema.org/InStock" } }),
    ...(data.expert_rating && { aggregateRating: { "@type": "AggregateRating", ratingValue: data.expert_rating, bestRating: "5" } }),
  };

  const handleContactClick = () => {
    if (!currentUser) { navigate("/login"); return; }
    setDrawerOpen(true);
  };

  return (
    <div className="gig-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <div className="gig-layout">
        {/* ── LEFT ── */}
        <div className="gig-left">

          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <span>Topmark</span>
            <span className="sep">›</span>
            <span>{data.category_name || "Gigs"}</span>
          </nav>

          {/* Title */}
          <h1 className="gig-title">{data.title}</h1>

          {/* Seller row */}
          <div className="seller-row">
            {data.expert_avatar ? (
              <img className="avatar sm" src={data.expert_avatar} alt={data.expert_username} style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar sm">{data.expert_username?.charAt(0).toUpperCase()}</div>
            )}
            <span className="seller-name">{data.expert_username}</span>
            {data.expert_badge && <span className="badge">{data.expert_badge}</span>}
            <StarRating rating={data.expert_rating} reviewCount={data.review_count} />
            {data.orders_in_queue != null && (
              <span className="queue-count">{data.orders_in_queue} orders in queue</span>
            )}
          </div>

          {/* Image gallery — uses cover_image + images array */}
          <ImageGallery images={allImages} title={data.title} />

          {/* About */}
          <section className="gig-section">
            <h2>About This Gig</h2>
            <p>{data.description}</p>
          </section>

          {/* Packages — left-side cards */}
          {data.packages?.length > 0 && (
            <section className="gig-section">
              <h2>Packages</h2>
              <div className="pkg-cards">
                {data.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`pkg-card ${selectedPackage?.id === pkg.id ? "active" : ""} tier-${pkg.tier}`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="pkg-tier">{pkg.tier.toUpperCase()}</div>
                    <div className="pkg-name">{pkg.name}</div>
                    <div className="pkg-price">${pkg.price}</div>
                    <div className="pkg-meta">
                      <span>⏱ {pkg.delivery_days}d delivery</span>
                      <span>🔄 {pkg.revision_number} revisions</span>
                    </div>
                    <ul className="pkg-features">
                      {pkg.features.map((f, i) => (
                        <li key={i}>
                          <svg viewBox="0 0 24 24" width="13" height="13"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {pkg.description && <p className="pkg-desc">{pkg.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About the Expert */}
          <section className="gig-section">
            <h2>About the Expert</h2>
            <div className="expert-card">
              {data.expert_avatar ? (
                <img className="avatar lg" src={data.expert_avatar} alt={data.expert_username} style={{ objectFit: 'cover' }} />
              ) : (
                <div className="avatar lg">{data.expert_username?.charAt(0).toUpperCase()}</div>
              )}
              <div className="expert-info">
                <span className="expert-name">{data.expert_username}</span>
                <StarRating rating={data.expert_rating} reviewCount={data.review_count} />
                {data.expert_bio && <p className="expert-bio">{data.expert_bio}</p>}
              </div>
              {!isOwner && (
                <button className="btn-contact-expert" onClick={handleContactClick}>
                  Contact Me
                </button>
              )}
            </div>
          </section>

        </div>

        {/* ── RIGHT (sticky price box) ── */}
        {!isOwner && selectedPackage && (
          <div className="gig-right">
            <div className="price-box">

              {/* Tier tabs */}
              {data.packages?.length > 1 && (
                <div className="tier-tabs">
                  {data.packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      className={`tier-tab ${selectedPackage.id === pkg.id ? "active" : ""} tier-${pkg.tier}`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {pkg.tier.charAt(0).toUpperCase() + pkg.tier.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              {/* Package details */}
              <div className="price-box__body">
                <div className="price-box__name-price">
                  <span className="price-box__pkg-name">{selectedPackage.name}</span>
                  <span className="price-box__price">${selectedPackage.price}</span>
                </div>
                <p className="price-box__desc">{selectedPackage.description}</p>

                <div className="price-box__meta">
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span>{selectedPackage.delivery_days}-day delivery</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
                    <span>{selectedPackage.revision_number} revisions</span>
                  </div>
                </div>

                {/* What's included accordion */}
                {selectedPackage.features?.length > 0 && (
                  <div className="whats-included">
                    <button className="wi-toggle" onClick={() => setWhatsIncludedOpen(o => !o)}>
                      What's Included
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ transform: whatsIncludedOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                    {whatsIncludedOpen && (
                      <ul className="wi-list">
                        {selectedPackage.features.map((f, i) => (
                          <li key={i}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1a9e60" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round"/></svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <button
                  className="btn-continue"
                  onClick={() => navigate(`/pay/${selectedPackage.id}`)}
                >
                  Continue <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round"/></svg>
                </button>

                <button className="btn-contact" onClick={handleContactClick}>
                  Contact me ▾
                </button>

                <p className="price-box__hint">
                  Discuss requirements, negotiate, and pay only after agreeing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact drawer */}
      {!isOwner && (
        <ContactDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          expertUsername={data.expert_username}
          expertId={data.expert_user_id}
          gigId={data.id}
          gigTitle={data.title}
        />
      )}
    </div>
  );
};

export default Gig;