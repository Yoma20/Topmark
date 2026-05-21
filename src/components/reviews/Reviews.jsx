import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import newRequest from "../../utils/newRequest";
import "./reviews.scss";

const Reviews = ({ expertId }) => {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState("");

  const { isLoading, error, data: reviews = [] } = useQuery({
    queryKey: ["reviews", expertId],
    queryFn: () =>
      newRequest
        .get(`/gigs/experts/${expertId}/reviews/`)
        .then((res) => res.data),
    enabled: !!expertId,
  });

  if (isLoading) return <div className="reviews__loading">Loading reviews…</div>;
  if (error)     return <div className="reviews__error">Could not load reviews.</div>;

  return (
    <div className="reviews">
      <h2 className="reviews__heading">Reviews</h2>

      {reviews.length === 0 ? (
        <p className="reviews__empty">No reviews yet for this expert.</p>
      ) : (
        <div className="reviews__list">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

function ReviewItem({ review }) {
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="review-item">
      <div className="review-item__header">
        <div className="review-item__avatar">
          {(review.student_username ?? "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="review-item__name">{review.student_username ?? "Anonymous"}</p>
          {date && <p className="review-item__date">{date}</p>}
        </div>
        <div className="review-item__stars">
          {"★".repeat(review.rating ?? 0)}
          {"☆".repeat(5 - (review.rating ?? 0))}
        </div>
      </div>
      {review.comment && (
        <p className="review-item__comment">{review.comment}</p>
      )}
    </div>
  );
}

export default Reviews;