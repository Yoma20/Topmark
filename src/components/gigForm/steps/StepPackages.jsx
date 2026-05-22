const TIERS = ["basic", "standard", "premium"];

export function StepPackages({ state, errors, handlePackageChange, featureInput, setFeatureInput, addFeature, removeFeature }) {
  return (
    <div className="step-panel">
      <p className="hint" style={{ marginBottom: 24 }}>
        Define up to three pricing tiers. Buyers will choose the one that fits their needs.
      </p>
      <div className="packages-grid">
        {TIERS.map(tier => {
          const pkg = state.packages.find(p => p.tier === tier);
          return (
            <div key={tier} className={`package-card package-card--${tier}`}>
              <div className="package-header">
                <span className="tier-badge">{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
              </div>
              <input
                placeholder="Package name"
                value={pkg.name}
                onChange={e => handlePackageChange(tier, "name", e.target.value)}
              />
              <textarea
                placeholder="What's included"
                rows={2}
                value={pkg.description}
                onChange={e => handlePackageChange(tier, "description", e.target.value)}
              />
              <div className="pkg-row">
                <div className="pkg-field">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={e => handlePackageChange(tier, "price", e.target.value)}
                  />
                </div>
                <div className="pkg-field">
                  <label>Delivery (days)</label>
                  <input
                    type="number"
                    value={pkg.delivery_days}
                    onChange={e => handlePackageChange(tier, "delivery_days", e.target.value)}
                  />
                </div>
                <div className="pkg-field">
                  <label>Revisions</label>
                  <input
                    type="number"
                    value={pkg.revision_number}
                    onChange={e => handlePackageChange(tier, "revision_number", e.target.value)}
                  />
                </div>
              </div>
              <div className="feature-input">
                <input
                  placeholder="Add a feature"
                  value={featureInput[tier]}
                  onChange={e => setFeatureInput(prev => ({ ...prev, [tier]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addFeature(tier)}
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
      {(errors.pkg_name || errors.pkg_price || errors.pkg_days) && (
        <div className="step-errors">
          {errors.pkg_name  && <p className="field-error">{errors.pkg_name}</p>}
          {errors.pkg_price && <p className="field-error">{errors.pkg_price}</p>}
          {errors.pkg_days  && <p className="field-error">{errors.pkg_days}</p>}
        </div>
      )}
    </div>
  );
}