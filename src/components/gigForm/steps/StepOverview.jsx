export function StepOverview({ state, errors, handleChange, categoriesData }) {
    return (
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
          {errors.title && <span className="field-error">{errors.title}</span>}
          <span className="char-count">{state.title.length} / 80</span>
        </div>
  
        <div className="field-group">
          <label>Category</label>
          <select name="category" onChange={handleChange} value={state.category}>
            <option value="">Select a category</option>
            {(Array.isArray(categoriesData) ? categoriesData : []).map(cat => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.subcategories?.length > 0
                  ? cat.subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))
                  : <option value={cat.id}>{cat.name}</option>
                }
              </optgroup>
            ))}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>
  
        <div className="field-row">
          <div className="field-group">
            <label>Short Title</label>
            <input
              name="short_title"
              placeholder="Brief label for your gig card"
              onChange={handleChange}
              value={state.short_title}
            />
            {errors.short_title && <span className="field-error">{errors.short_title}</span>}
          </div>
          <div className="field-group">
            <label>Short Description</label>
            <textarea
              name="short_description"
              rows={3}
              placeholder="One or two sentences shown in search results"
              onChange={handleChange}
              value={state.short_description}
            />
            {errors.short_description && <span className="field-error">{errors.short_description}</span>}
          </div>
        </div>
  
        <div className="field-group">
          <label>Full Description</label>
          <textarea
            name="description"
            rows={7}
            placeholder="Describe what you offer, your process, and why buyers should choose you."
            onChange={handleChange}
            value={state.description}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>
  
        <div className="field-group">
          <label>Requirements Prompt</label>
          <p className="hint">What info do you need from the buyer before starting?</p>
          <textarea
            name="requirements_prompt"
            rows={4}
            placeholder="e.g. Please share: 1) Topic  2) Word count  3) Citation style"
            onChange={handleChange}
            value={state.requirements_prompt}
          />
        </div>
      </div>
    );
  }