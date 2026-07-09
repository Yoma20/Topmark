export function StepPublish({ state, isEdit, mutation, handleSubmit }) {
    return (
      <div className="step-panel publish-step">
        <div className="publish-summary">
          <h3>{isEdit ? "Ready to update?" : "Ready to publish?"}</h3>
          <p>
            {isEdit
              ? "Review your changes before saving."
              : "Review your gig details before going live."}
          </p>
          <div className="summary-row">
            <span>Title</span>
            <strong>{state.title || <em>Not set</em>}</strong>
          </div>
          <div className="summary-row">
            <span>Category</span>
            <strong>{state.category || <em>Not set</em>}</strong>
          </div>
          <div className="summary-row">
            <span>Packages</span>
            <strong>{state.packages.filter(p => p.name).length} configured</strong>
          </div>
          <div className="summary-row">
            <span>Extras</span>
            <strong>{state.extras.length} add-on(s)</strong>
          </div>
          <div className="summary-row">
            <span>Cover image</span>
            <strong>{state.cover_image ? "Uploaded ✓" : <em>Not uploaded</em>}</strong>
          </div>
        </div>
  
        <button
          className="btn-publish"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? isEdit ? "Saving…" : "Publishing…"
            : isEdit ? "Save Changes" : "Publish Gig"}
        </button>
  
        {mutation.isError && (
          <p className="error-msg">
            {mutation.error?.response?.data?.detail
              || mutation.error?.response?.data?.non_field_errors?.[0]
              || "Something went wrong. Please try again."}
          </p>
        )}
      </div>
    );
  }