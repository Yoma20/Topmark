export function StepMedia({ state, errors, isEdit, singleFile, setSingleFile, files, setFiles, uploading, handleUpload }) {
    return (
      <div className="step-panel">
        <div className="upload-zone">
  
          {/* Show existing cover in edit mode */}
          {isEdit && state.cover_image && (
            <div className="upload-item">
              <label>Current Cover Image</label>
              <img
                src={state.cover_image}
                alt="Current cover"
                className="current-cover-preview"
              />
              <p className="hint" style={{ marginTop: 6 }}>
                Upload a new image below to replace it, or leave empty to keep the current one.
              </p>
            </div>
          )}
  
          <div className="upload-item">
            <label>{isEdit ? "Replace Cover Image" : "Cover Image"}</label>
            {!isEdit && (
              <p className="hint">This is the thumbnail shown in search results. Use a clear, high-quality image.</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => setSingleFile(e.target.files[0])}
            />
            {singleFile && <span className="file-name">✓ {singleFile.name}</span>}
          </div>
  
          <div className="upload-item">
            <label>Gallery Images</label>
            <p className="hint">
              {isEdit
                ? "Upload new gallery images to replace the existing ones, or leave empty to keep them."
                : "Upload up to 3 additional images showcasing your work."}
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => setFiles(e.target.files)}
            />
            {files.length > 0 && <span className="file-name">✓ {files.length} file(s) selected</span>}
          </div>
  
          <button
            type="button"
            className="btn-upload"
            onClick={handleUpload}
            disabled={uploading || (!singleFile && !files.length)}
          >
            {uploading ? "Uploading…" : "Upload Images"}
          </button>
  
          {errors.cover_image && <p className="field-error">{errors.cover_image}</p>}
          {state.cover_image   && <p className="upload-success">✓ Cover image ready</p>}
        </div>
      </div>
    );
  }