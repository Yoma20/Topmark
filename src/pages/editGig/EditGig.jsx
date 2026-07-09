import '../add/add.scss'; // reuses the exact same styles
import { useParams } from "react-router-dom";
import { useGigForm, STEPS } from "../../components/gigForm/useGigForm";
import { StepOverview }  from "../../components/gigForm/steps/StepOverview";
import { StepPackages }  from "../../components/gigForm/steps/StepPackages";
import { StepExtras }    from "../../components/gigForm/steps/StepExtras";
import { StepMedia }     from "../../components/gigForm/steps/StepMedia";
import { StepPublish }   from "../../components/gigForm/steps/StepPublish";

const EditGig = () => {
  const { slug } = useParams();
  const form = useGigForm(slug); // slug present = edit mode

  // Loading states
  if (form.gigLoading || !form.state) {
    return (
      <div className="add">
        <div className="container">
          <div className="gig-form-loading">Loading gig…</div>
        </div>
      </div>
    );
  }

  const stepProps = { ...form, isEdit: true };

  const renderStep = () => {
    switch (form.step) {
      case 0: return <StepOverview  {...stepProps} />;
      case 1: return <StepPackages  {...stepProps} />;
      case 2: return <StepExtras    {...stepProps} />;
      case 3: return <StepMedia     {...stepProps} />;
      case 4: return <StepPublish   {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className="add">
      <div className="container">
        {/* Step nav — identical to Add */}
        <nav className="step-nav">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`step-nav__item ${i === form.step ? "active" : ""} ${i < form.step ? "done" : ""}`}
              onClick={() => form.setStep(i)}
            >
              <span className="step-num">{i < form.step ? "✓" : i + 1}</span>
              {s}
            </button>
          ))}
        </nav>

        {/* Panel — only difference: title has "Edit · " prefix */}
        <div className="panel">
          <h2 className="panel-title">
            <span className="edit-mode-label">Edit · </span>
            {STEPS[form.step]}
          </h2>
          {renderStep()}
        </div>

        {/* Footer nav — identical to Add */}
        <div className="step-footer">
          {form.step > 0 && (
            <button className="btn-ghost" onClick={form.goBack}>← Back</button>
          )}
          {form.step < STEPS.length - 1 && (
            <button className="btn-primary" onClick={form.goNext}>Continue →</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditGig;