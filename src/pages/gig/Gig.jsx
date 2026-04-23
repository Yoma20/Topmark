import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Link, useParams } from "react-router-dom";

const StarRating = ({ rating }) => {
  const value = parseFloat(rating);
  if (!value) return <span style={{ color: '#aaa', fontSize: '0.85rem' }}>New</span>;
  return (
    <div className="stars">
      {Array(Math.round(value)).fill().map((_, i) => (
        <img src="/images/star.png" alt="star" key={i} style={{ width: 18 }} />
      ))}
      <span style={{ color: '#f5a623', fontWeight: 600 }}>{value.toFixed(1)}</span>
    </div>
  );
};

const PackageCard = ({ pkg, selected, onSelect }) => (
  <div
    className={`package-card ${selected ? 'package-card--active' : ''} ${pkg.tier === 'premium' ? 'package-card--premium' : ''}`}
    onClick={() => onSelect(pkg)}
  >
    <div className="package-tier">{pkg.tier.toUpperCase()}</div>
    <div className="package-name">{pkg.name}</div>
    <div className="package-price">${pkg.price}</div>
    <div className="package-meta">
      <span>⏱ {pkg.delivery_days} days</span>
      <span>🔄 {pkg.revision_number} revisions</span>
    </div>
    <ul className="package-features">
      {pkg.features.map((f, i) => (
        <li key={i}>✓ {f}</li>
      ))}
    </ul>
    <p style={{ fontSize: '0.85rem', color: '#555', marginTop: 8 }}>{pkg.description}</p>
  </div>
);

const Gig = () => {
  const { id } = useParams();
  const [selectedPackage, setSelectedPackage] = useState(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => newRequest.get(`/gigs/${id}/`).then((res) => res.data),
    onSuccess: (data) => {
      if (data.packages?.length) setSelectedPackage(data.packages[0]);
    }
  });

  const sliderSettings = {
    dots: true, infinite: true, slidesToShow: 1, slidesToScroll: 1,
  };

  if (isLoading) return <div className="loader"></div>;
  if (error) return <h4 style={{ color: 'red', textAlign: 'center' }}>Something went wrong</h4>;

  return (
    <div className="gig">
      <div className="container">
        <div className="left">
          <span className="breadcrumbs">TOPMARK &gt; {data.category_name || 'GIGS'}</span>
          <h1>{data.title}</h1>
          <div className="user">
            <div className="avatar">{data.expert_username?.charAt(0).toUpperCase()}</div>
            <span>{data.expert_username}</span>
            <StarRating rating={data.expert_rating} />
          </div>

          {data.images?.length > 0 && (
            <Slider {...sliderSettings} className="slider">
              {data.images.map((img, i) => (
                <div key={i}><img src={img} alt="" /></div>
              ))}
            </Slider>
          )}

          <h2>About This Gig</h2>
          <p>{data.description}</p>

          {/* Pricing table */}
          <h2>Packages</h2>
          <div className="packages">
            {data.packages?.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                selected={selectedPackage?.id === pkg.id}
                onSelect={setSelectedPackage}
              />
            ))}
          </div>

          <h2>About the Expert</h2>
          <div className="seller">
            <div className="avatar large">{data.expert_username?.charAt(0).toUpperCase()}</div>
            <div className="info">
              <span className="name">{data.expert_username}</span>
              <StarRating rating={data.expert_rating} />
            </div>
          </div>
        </div>

        <div className="right">
          {selectedPackage && (
            <div className="price-box">
              <div className="tier-tabs">
                {data.packages?.map((pkg) => (
                  <button
                    key={pkg.id}
                    className={`tier-tab ${selectedPackage.id === pkg.id ? 'active' : ''} ${pkg.tier === 'premium' ? 'premium' : ''}`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.tier.charAt(0).toUpperCase() + pkg.tier.slice(1)}
                  </button>
                ))}
              </div>
              <h3>{selectedPackage.name}</h3>
              <h2>${selectedPackage.price}</h2>
              <p>{selectedPackage.description}</p>
              <div className="details">
                <div className="item">
                  <img src="/images/clock.png" alt="" />
                  <span>{selectedPackage.delivery_days} days delivery</span>
                </div>
                <div className="item">
                  <img src="/images/recycle.png" alt="" />
                  <span>{selectedPackage.revision_number} revisions</span>
                </div>
              </div>
              <ul className="features">
                {selectedPackage.features.map((f, i) => (
                  <li key={i}>
                    <img src="/images/greencheck.png" alt="" />{f}
                  </li>
                ))}
              </ul>
              <Link to={`/pay/${id}?package=${selectedPackage.id}`}>
                <button className="continue-btn">Continue</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gig;