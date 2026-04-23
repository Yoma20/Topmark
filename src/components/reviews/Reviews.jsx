import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import "./reviews.scss";

const Reviews = ({ assignmentId, expertId }) => {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState("");

  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews", expertId],
    queryFn: () =>
      newRequest
        .get(`/api/assignments/reviews/?expert=${expertId}`)
        .then((res) => res.data),
    enabled: !!expertId,
  });

  const mutation = useMutation({
    mutationFn: (review) =>
      newRequest.post("/api/assignments/reviews/", review),
    onSuccess: () => {
      setFormError("");
      queryClient.invalidateQueries(["reviews", expertId]);
    },
    onError: (err) => {
      const detail =
        err?.response?.data?.assignment ||
        err?.response?.data?.detail ||
        "Could not submit review. Please try again.";
      setFormError(Array.isArray(detail) ? detail[0] : detail);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const comment = e.target[0].value.trim();
    const rating = parseInt(e.target[1].value, 10);
    if (!comment) {
      setFormError("Please write a comment before submitting.");
      return;
    }
    mutation.mutate({ assignment: assignmentId, rating, comment });
    e.target.reset();
  };

  return (
    <div className="reviews">
      <h2>Reviews</h2>
      {isLoading
        ? "Loading…"
        : error
        ? "Something went wrong loading reviews."
        : data?.length === 0
        ? <p className="text-gray-400 italic">No reviews yet — be the first!</p>
        : data.map((review) => <Review key={review.id} review={review} />)}

      <div className="add">
        <h3>Add a review</h3>
        {formError && <p style={{ color: "red", fontSize: "14px" }}>{formError}</p>}
        <form className="addForm" onSubmit={handleSubmit}>
          <input type="text" placeholder="Write your opinion…" />
          <select defaultValue={5}>
            <option value={1}>1 — Poor</option>
            <option value={2}>2 — Fair</option>
            <option value={3}>3 — Good</option>
            <option value={4}>4 — Very Good</option>
            <option value={5}>5 — Excellent</option>
          </select>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reviews;