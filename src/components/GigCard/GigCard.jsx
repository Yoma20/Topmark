import React, { useState } from "react";
import './gigCard.scss';
import { Link } from "react-router-dom";

const GigCard = ({ item }) => {
  const [saved, setSaved] = useState(item.is_saved ?? false);

  const rating = parseFloat(item.expert_rating);
  const hasRating = rating > 0;

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(s => !s);
    // TODO: persist — e.g. newRequest.post(`/gigs/${item.slug}/save/`)
  };

  return (
    <Link to={`/gig/${item.slug}`} className="link">
      <div className="gigCard">
        <img
          className="cover-img"
          src={item.cover_image || '/images/noavatar.jpeg'}
          alt={item.title}
          loading="lazy"
        />
        <div className="info">
          <div className="user">
            {item.expert_avatar ? (
              <img
                src={item.expert_avatar}
                alt={item.expert_username}
              />
            ) : (
              <div className="avatar-initial">
                {item.expert_username?.charAt(0).toUpperCase() || "E"}
              </div>
            )}
            <span>{item.expert_username}</span>
          </div>
          <p>{item.short_description || item.description?.slice(0, 100)}</p>
          <div className="star">
            <img src="/images/star.png" alt="star rating" />
            <span>
              {hasRating ? rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>
        <hr />
        <div className="details">
          <button
            className={`heart-btn${saved ? " heart-btn--saved" : ""}`}
            onClick={handleSave}
            aria-label={saved ? "Remove from favourites" : "Save to favourites"}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div className="price">
            <span>STARTING AT</span>
            <h2>$ {item.starting_price ?? "—"}</h2>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;