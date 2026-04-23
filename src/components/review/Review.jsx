import React, { useState } from "react";
import "./review.scss";

const Review = ({ review }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // Django serializer embeds the full student object — no extra fetch needed
  const student = review.student;

  return (
    <div className="review">
      <div className="user">
        <img
          className="pp"
          src={student?.img || "/images/noavtar.jpeg"}
          alt={student?.username || "Reviewer"}
        />
        <div className="info">
          <span>{student?.username || "Anonymous"}</span>
          <div className="country">
            <span>{student?.country || ""}</span>
          </div>
        </div>
      </div>

      {/* review.rating replaces review.star */}
      <div className="stars">
        {Array(review.rating).fill().map((_, i) => (
          <img src="/images/star.png" alt="★" key={i} />
        ))}
        <span>{review.rating}</span>
      </div>

      {/* review.comment replaces review.desc */}
      <p>{review.comment}</p>

      <div className="helpful">
        <span>Helpful?</span>
        <img
          src={liked ? "/images/like.png" : "/images/likeColor.png"}
          alt="like"
          onClick={() => setLiked(true)}
        />
        <span>Yes</span>
        <img
          src={disliked ? "/images/dislike.png" : "/images/dislike_color.png"}
          alt="dislike"
          onClick={() => setDisliked(true)}
        />
        <span>No</span>
      </div>
    </div>
  );
};

export default Review;