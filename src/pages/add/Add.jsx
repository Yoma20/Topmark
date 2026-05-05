import { useState } from "react";
import './add.scss';
import upload from '../../utils/upload.js';
import { useQueryClient, useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

const STEPS = ["Overview", "Packages", "Extras", "Media", "Publish"];

const INITIAL_STATE = {
  title: "", description: "", short_title: "", short_description: "",
  category: "", cover_image: "", images: [], requirements_prompt: "",
  packages: [
    { tier: "basic",    name: "", description: "", price: "", delivery_days: "", revision_number: 1, features: [] },
    { tier: "standard", name: "", description: "", price: "", delivery_days: "", revision_number: 2, features: [] },
    { tier: "premium",  name: "", description: "", price: "", delivery_days: "", revision_number: 3, features: [] },
  ],
  extras: [],
};

const Add = () => {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(INITIAL_STATE);
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [featureInput, setFeatureInput] = useState({ basic: '', standard: '', premium: '' });
  const [extraInput, setExtraInput] = useState({ name: '', description: '', price: '', extra_days: 0 });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleChange = (e) =>
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePackageChange = (tier, field, value) =>
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p => p.tier === tier ? { ...p, [field]: value } : p),
    }));

  const addFeature = (tier) => {
    const val = featureInput[tier].trim();
    if (!val) return;
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p =>
        p.tier === tier ? { ...p, features: [...p.features, val] } : p
      ),
    }));
    setFeatureInput(prev => ({ ...prev, [tier]: '' }));
  };

  const removeFeature = (tier, feat) =>
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p =>
        p.tier === tier ? { ...p, features: p.features.filter(f => f !== feat) } : p
      ),
    }));

  const addExtra = () => {
    if (!extraInput.name || !extraInput.price) return;
    setState(prev => ({ ...prev, extras: [...prev.extras, { ...extraInput }] }));
    setExtraInput({ name: '', description: '', price: '', extra_days: 0 });
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover_image = await upload(singleFile);
      const images = await Promise.all([...files].map(upload));
      setState(prev => ({ ...prev, cover_image, images }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (gig) => newRequest.post("/gigs/create/", gig),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      navigate('/mygigs');
    },
  });

  const handleSubmit = () => mutation.mutate(state);

  const tiers = ['basic', 'standard', 'premium'];

  // ── Step panels ──────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      case 0: return (
        <div className="step-panel">
          <div className="field-group">
            <label>Gig Title</label>
            <p className="hint">Your title is the first thing buyers see — make it clear and keyword-rich.</p>
            <input
              name="title"
              maxLength={80}
              placeholder="e.g. I will write a professional research paper"
              onChange={handleChange}
              value={state.title}
            />
            <span className="char-count">{state.title.length} / 80</span>
          </div>

          <div className="field-group">
            <label>Category</label>
            <input name="category" placeholder="e.g. Writing & Translation" onChange={handleChange} value={state.category} />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Short Title</label>
              <input name="short_title" placeholder="Brief label for your gig card" onChange={handleChange} value={state.short_title} />
            </div>
            <div className="field-group">
              <label>Short Description</label>
              <textarea name="short_description" rows={3} placeholder="One or two sentences shown in search results" onChange={handleChange} value={state.short_description} />
            </div>
          </div>

          <div className="field-group">
            <label>Full Description</label>
            <textarea name="description" rows={7} placeholder="Describe what you offer, your process, and why buyers should choose you." onChange={handleChange} value={state.description} />
          </div>

          <div className="field-group">
            <label>Requirements Prompt</label>
            <p className="hint">What info do you need from the buyer before starting?</p>
            <textarea
              name="requirements_prompt" rows={4}
              placeholder="e.g. Please share: 1) Topic  2) Word count  3) Citation style"
              onChange={handleChange} value={state.requirements_prompt}
            />
          </div>
        </div>
      );

      case 1: return (
        <div className="step-panel">
          <p className="hint" style={{ marginBottom: 24 }}>Define up to three pricing tiers. Buyers will choose the one that fits their needs.</p>
          <div className="packages-grid">
            {tiers.map(tier => {
              const pkg = state.packages.find(p => p.tier === tier);
              return (
                <div key={tier} className={`package-card package-card--${tier}`}>
                  <div className="package-header">
                    <span className="tier-badge">{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                  </div>
                  <input placeholder="Package name" value={pkg.name}
                    onChange={e => handlePackageChange(tier, 'name', e.target.value)} />
                  <textarea placeholder="What's included" rows={2} value={pkg.description}
                    onChange={e => handlePackageChange(tier, 'description', e.target.value)} />
                  <div className="pkg-row">
                    <div className="pkg-field">
                      <label>Price ($)</label>
                      <input type="number" value={pkg.price}
                        onChange={e => handlePackageChange(tier, 'price', e.target.value)} />
                    </div>
                    <div className="pkg-field">
                      <label>Delivery (days)</label>
                      <input type="number" value={pkg.delivery_days}
                        onChange={e => handlePackageChange(tier, 'delivery_days', e.target.value)} />
                    </div>
                    <div className="pkg-field">
                      <label>Revisions</label>
                      <input type="number" value={pkg.revision_number}
                        onChange={e => handlePackageChange(tier, 'revision_number', e.target.value)} />
                    </div>
                  </div>
                  <div className="feature-input">
                    <input
                      placeholder="Add a feature"
                      value={featureInput[tier]}
                      onChange={e => setFeatureInput(prev => ({ ...prev, [tier]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addFeature(tier)}
                    />
                    <button type="button" className="btn-add-feat" onClick={() => addFeature(tier)}>+</button>
                  </div>
                  {pkg.features.length > 0 && (
                    <ul className="features-list">
                      {pkg.features.map(f => (
                        <li key={f}>
                          <span className="feat-check">✓</span> {f}
                          <button type="button" onClick={() => removeFeature(tier, f)}>✕</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

      case 2: return (
        <div className="step-panel">
          <p className="hint" style={{ marginBottom: 24 }}>Add optional extras buyers can purchase alongside any package.</p>
          <div className="extra-builder">
            <div className="field-row">
              <input placeholder="Extra name (e.g. 24-hr delivery)" value={extraInput.name}
                onChange={e => setExtraInput(prev => ({ ...prev, name: e.target.value }))} />
              <input placeholder="Description" value={extraInput.description}
                onChange={e => setExtraInput(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="field-row narrow">
              <input type="number" placeholder="Price ($)" value={extraInput.price}
                onChange={e => setExtraInput(prev => ({ ...prev, price: e.target.value }))} />
              <input type="number" placeholder="Extra days" value={extraInput.extra_days}
                onChange={e => setExtraInput(prev => ({ ...prev, extra_days: e.target.value }))} />
              <button type="button" className="btn-secondary" onClick={addExtra}>Add Extra</button>
            </div>
          </div>

          {state.extras.length > 0 && (
            <div className="extras-list">
              {state.extras.map((ex, i) => (
                <div key={i} className="extra-tag">
                  <div>
                    <strong>{ex.name}</strong>
                    {ex.description && <span> — {ex.description}</span>}
                  </div>
                  <div className="extra-meta">
                    <span>${ex.price}</span>
                    {ex.extra_days > 0 && <span>+{ex.extra_days}d</span>}
                    <button type="button" onClick={() => setState(prev => ({
                      ...prev, extras: prev.extras.filter((_, j) => j !== i)
                    }))}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 3: return (
        <div className="step-panel">
          <div className="upload-zone">
            <div className="upload-item">
              <label>Cover Image</label>
              <p className="hint">This is the thumbnail shown in search results. Use a clear, high-quality image.</p>
              <input type="file" accept="image/*" onChange={e => setSingleFile(e.target.files[0])} />
              {singleFile && <span className="file-name">✓ {singleFile.name}</span>}
            </div>
            <div className="upload-item">
              <label>Gallery Images</label>
              <p className="hint">Upload up to 3 additional images showcasing your work.</p>
              <input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} />
              {files.length > 0 && <span className="file-name">✓ {files.length} file(s) selected</span>}
            </div>
            <button type="button" className="btn-upload" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload Images"}
            </button>
            {state.cover_image && <p className="upload-success">✓ Images uploaded successfully</p>}
          </div>
        </div>
      );

      case 4: return (
        <div className="step-panel publish-step">
          <div className="publish-summary">
            <h3>Ready to publish?</h3>
            <p>Review your gig details before going live.</p>
            <div className="summary-row"><span>Title</span><strong>{state.title || <em>Not set</em>}</strong></div>
            <div className="summary-row"><span>Category</span><strong>{state.category || <em>Not set</em>}</strong></div>
            <div className="summary-row"><span>Packages</span><strong>{state.packages.filter(p => p.name).length} configured</strong></div>
            <div className="summary-row"><span>Extras</span><strong>{state.extras.length} add-on(s)</strong></div>
            <div className="summary-row"><span>Cover image</span><strong>{state.cover_image ? "Uploaded ✓" : <em>Not uploaded</em>}</strong></div>
          </div>

          <button className="btn-publish" onClick={handleSubmit} disabled={mutation.isLoading}>
            {mutation.isLoading ? "Publishing…" : "Publish Gig"}
          </button>
          {mutation.isError && <p className="error-msg">Something went wrong. Please try again.</p>}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="add">
      <div className="container">
        {/* Step nav */}
        <nav className="step-nav">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`step-nav__item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
            >
              <span className="step-num">{i < step ? '✓' : i + 1}</span>
              {s}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="panel">
          <h2 className="panel-title">{STEPS[step]}</h2>
          {renderStep()}
        </div>

        {/* Footer nav */}
        <div className="step-footer">
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          {step < STEPS.length - 1 && (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Add;