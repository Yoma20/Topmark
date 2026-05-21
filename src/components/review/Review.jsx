import { useState } from "react";
import "./review.scss";

const Review = ({ review }) => {
  const [vote, setVote] = useState(null); // 'helpful' | 'not_helpful' | null

  const student = review.student;

  return (
    <div className="review">
      <div className="review__user">
        <img
          className="review__avatar"
          src={student?.img || "/images/noavtar.jpeg"}
          alt={student?.username || "Reviewer"}
        />
        <div className="review__info">
          <span className="review__name">{student?.username || "Anonymous"}</span>
          {student?.country && (
            <span className="review__country">{student.country}</span>
          )}
        </div>
      </div>

      <div className="review__stars">
        {"★".repeat(review.rating ?? 0)}
        {"☆".repeat(5 - (review.rating ?? 0))}
        <span className="review__rating-num">{review.rating}/5</span>
      </div>

      <p className="review__comment">{review.comment}</p>

      <div className="review__helpful">
        <span>Helpful?</span>
        <button
          className={`review__vote${vote === "helpful" ? " review__vote--active" : ""}`}
          onClick={() => setVote(v => v === "helpful" ? null : "helpful")}
        >
          👍 Yes
        </button>
        <button
          className={`review__vote${vote === "not_helpful" ? " review__vote--active" : ""}`}
          onClick={() => setVote(v => v === "not_helpful" ? null : "not_helpful")}
        >
          👎 No
        </button>
      </div>
    </div>
  );
};

export default Review;