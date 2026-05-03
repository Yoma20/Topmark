import React from "react";
import './gigCard.scss';
import { Link } from "react-router-dom";

const GigCard = ({ item }) => {
  const rating = parseFloat(item.expert_rating);
  const hasRating = rating > 0;

  return (
    <Link to={`/gig/${item.id}`} className="link">
      <div className="gigCard">
        <img
          src={item.cover_image || '/images/noavatar.jpeg'}
          alt={item.title}
          loading="lazy"
        />
        <div className="info">
          <div className="user">
            <div className="avatar-initial">
              {item.expert_username?.charAt(0).toUpperCase() || "E"}
            </div>
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
          <img src="/images/heart.png" alt="save to favourites" />
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