export function StepExtras({ state, extraInput, setExtraInput, addExtra, removeExtra }) {
    return (
      <div className="step-panel">
        <p className="hint" style={{ marginBottom: 24 }}>
          Add optional extras buyers can purchase alongside any package.
        </p>
        <div className="extra-builder">
          <div className="field-row">
            <input
              placeholder="Extra name (e.g. 24-hr delivery)"
              value={extraInput.name}
              onChange={e => setExtraInput(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              placeholder="Description"
              value={extraInput.description}
              onChange={e => setExtraInput(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="field-row narrow">
            <input
              type="number"
              placeholder="Price ($)"
              value={extraInput.price}
              onChange={e => setExtraInput(prev => ({ ...prev, price: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Extra days"
              value={extraInput.extra_days}
              onChange={e => setExtraInput(prev => ({ ...prev, extra_days: e.target.value }))}
            />
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
                  <button type="button" onClick={() => removeExtra(i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }