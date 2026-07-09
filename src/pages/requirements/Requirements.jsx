import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./requirements.scss";

const CITATION_STYLES = ["APA", "MLA", "Harvard", "Chicago", "Vancouver", "None"];

const Requirements = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    citation_style: "APA",
    word_count: "",
    additional_notes: "",
    answers: "",
  });
  const [rubricFile, setRubricFile] = useState(null);
  const [error, setError] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => newRequest.get(`/gigs/orders/${orderId}/`).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("citation_style", form.citation_style);
      fd.append("word_count", form.word_count);
      fd.append("additional_notes", form.additional_notes);
      fd.append("answers", form.answers);
      if (rubricFile) fd.append("rubric_file", rubricFile);
      return newRequest.post(`/gigs/orders/${orderId}/requirements/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => navigate(`/orders/${orderId}`),
    onError: (err) => {
      const detail = err?.response?.data?.detail || "Failed to submit. Please try again.";
      setError(detail);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.word_count || isNaN(form.word_count)) {
      setError("Please enter a valid word count.");
      return;
    }
    mutation.mutate();
  };

  if (isLoading) return (
    <div className="req req--loading">
      <div className="req__spinner" />
    </div>
  );

  if (order?.requirements_submitted || order?.status === "in_progress") {
    return (
      <div className="req req--done">
        <div className="req__done-box">
          <div className="req__done-icon">✓</div>
          <h2>Requirements already submitted</h2>
          <p>Your expert has everything they need. You can track progress on your order page.</p>
          <button onClick={() => navigate(`/orders/${orderId}`)} className="req__btn">
            View Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="req">
      <div className="req__container">

        <div className="req__header">
          <button className="req__back" onClick={() => navigate(`/orders/${orderId}`)}>
            ← Back to order
          </button>
          <h1 className="req__title">Tell your expert what you need</h1>
          {order && (
            <p className="req__subtitle">
              Order #{orderId} · <strong>{order.gig_title}</strong>
            </p>
          )}
        </div>

        <form className="req__form" onSubmit={handleSubmit}>

          {error && <div className="req__error">{error}</div>}

          <div className="req__field">
            <label className="req__label">Citation style</label>
            <select
              className="req__select"
              value={form.citation_style}
              onChange={e => setForm(f => ({ ...f, citation_style: e.target.value }))}
            >
              {CITATION_STYLES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="req__field">
            <label className="req__label">Word count</label>
            <input
              className="req__input"
              type="number"
              min="1"
              placeholder="e.g. 2500"
              value={form.word_count}
              onChange={e => setForm(f => ({ ...f, word_count: e.target.value }))}
              required
            />
          </div>

          <div className="req__field">
            <label className="req__label">
              Additional notes
              <span className="req__label-hint">Topic, angle, sources to use, things to avoid…</span>
            </label>
            <textarea
              className="req__textarea"
              rows={5}
              placeholder="Be as specific as possible. Include your essay question or assignment brief here."
              value={form.additional_notes}
              onChange={e => setForm(f => ({ ...f, additional_notes: e.target.value }))}
            />
          </div>

          <div className="req__field">
            <label className="req__label">
              Answers to expert questions
              <span className="req__label-hint">Optional — if your expert asked anything during messaging</span>
            </label>
            <textarea
              className="req__textarea"
              rows={3}
              placeholder="Any answers to questions your expert has already asked…"
              value={form.answers}
              onChange={e => setForm(f => ({ ...f, answers: e.target.value }))}
            />
          </div>

          <div className="req__field">
            <label className="req__label">
              Rubric / marking guide
              <span className="req__label-hint">Optional but highly recommended — PDF, DOC, or image</span>
            </label>
            <label className="req__file-label">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={e => setRubricFile(e.target.files[0])}
                className="req__file-input"
              />
              <span className="req__file-btn">
                {rubricFile ? `✓ ${rubricFile.name}` : "Choose file"}
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="req__submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Submitting…" : "Submit Requirements"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Requirements;