// src/pages/profile/ProfileEdit.jsx
import { useState, useContext, useRef } from 'react';
import AuthContext from '../../AuthContext';
import newRequest from '../../utils/newRequest';
import './ProfileEdit.scss';

const LANGUAGES = ['English','French','Spanish','German','Arabic','Swahili','Portuguese','Chinese'];

export default function ProfileEdit() {
  const { user, setUser } = useContext(AuthContext);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    displayName: user?.username || '',
    title: user?.title || '',
    location: user?.country || 'Kenya',
    languages: user?.languages || [],
    bio: user?.bio || '',
    skills: user?.skills || [],
    workExp: user?.workExp || [],
    education: user?.education || [],
    certifications: user?.certifications || [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [openSections, setOpenSections] = useState({ about: false, skills: false, work: false, edu: false, cert: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadExpanded, setUploadExpanded] = useState(false);

  const toggle = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm(f => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const toggleLanguage = (lang) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await newRequest.patch('/users/me/', {
        username: form.displayName,
        bio: form.bio,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pe-page">
      <div className="pe-header">
        <h1>Edit your expert profile</h1>
        <p>You can come back and update your profile anytime.</p>
      </div>

      <div className="pe-card">
        {/* ── Avatar + identity ── */}
        <div className="pe-identity">
          <div className="pe-avatar-wrap" onClick={() => fileRef.current?.click()}>
            {user?.img
              ? <img src={user.img} alt="" className="pe-avatar-img" />
              : <div className="pe-avatar-placeholder"><span>{form.displayName?.slice(0,2).toUpperCase()}</span></div>
            }
            <div className="pe-avatar-overlay">📷</div>
            <input ref={fileRef} type="file" accept="image/*" hidden />
          </div>

          <div className="pe-identity-fields">
            <div className="pe-inline-field">
              <span className="pe-inline-field__value">{form.displayName || 'Add display name'}</span>
              <button className="pe-edit-btn" onClick={() => {
                const val = prompt('Display name:', form.displayName);
                if (val !== null) setForm(f => ({ ...f, displayName: val }));
              }}>✏️</button>
              <span className="pe-username">@{user?.username}</span>
            </div>

            <div className="pe-inline-field">
              <span className="pe-inline-field__value pe-inline-field__value--muted">{form.title || 'Add title'}</span>
              <button className="pe-edit-btn" onClick={() => {
                const val = prompt('Professional title:', form.title);
                if (val !== null) setForm(f => ({ ...f, title: val }));
              }}>✏️</button>
            </div>

            <div className="pe-meta-row">
              <span>📍 {form.location}</span>
              <span>·</span>
              <button className="pe-link-btn" onClick={() => {
                const sel = form.languages.length ? form.languages.join(', ') : 'Add languages';
                alert('Use the languages checkboxes in the About section to add languages.');
              }}>
                {form.languages.length ? form.languages.join(', ') : 'Add languages'}
              </button>
              <button className="pe-edit-btn">✏️</button>
            </div>
          </div>
        </div>

        {/* ── LinkedIn upload accordion ── */}
        <div className="pe-upload-accordion">
          <button className="pe-accordion-trigger" onClick={() => setUploadExpanded(e => !e)}>
            <span>Upload your experience <em>(8 min)</em></span>
            <span className="pe-badge">Recommended</span>
            <span className="pe-caret">{uploadExpanded ? '▲' : '▼'}</span>
          </button>
          {uploadExpanded && (
            <div className="pe-upload-body">
              <p><strong>Add experience from LinkedIn</strong></p>
              <ol>
                <li>Go to your profile on <strong>LinkedIn</strong></li>
                <li>Click on <strong>Resources</strong></li>
                <li>Click on <strong>Save to PDF</strong></li>
              </ol>
              <div className="pe-dropzone">
                <span>Drag and drop file or</span>
                <button className="pe-select-file-btn">📤 Select file</button>
              </div>
              <p className="pe-upload-alt"><strong>No LinkedIn?</strong> Upload your CV instead.</p>
            </div>
          )}
        </div>

        {/* ── Fill manually accordion trigger (collapsed) ── */}
        <div className="pe-upload-accordion pe-upload-accordion--secondary">
          <button className="pe-accordion-trigger pe-accordion-trigger--secondary">
            <span>Fill out profile manually <em>(15 min)</em></span>
            <span className="pe-edit-btn">✏️</span>
          </button>
        </div>
      </div>

      {/* ── About section ── */}
      <SectionCard
        title="About"
        desc="Share some details about yourself, your expertise, and what you offer."
        isOpen={openSections.about}
        onToggle={() => toggle('about')}
        buttonLabel="Add details"
      >
        <textarea
          className="pe-textarea"
          rows={5}
          placeholder="Describe your background and what makes you a great expert…"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
        />
        <div className="pe-section-label">Languages</div>
        <div className="pe-lang-grid">
          {LANGUAGES.map(lang => (
            <label key={lang} className="pe-lang-check">
              <input type="checkbox" checked={form.languages.includes(lang)} onChange={() => toggleLanguage(lang)} />
              {lang}
            </label>
          ))}
        </div>
      </SectionCard>

      {/* ── Skills ── */}
      <SectionCard
        title="Skills and expertise"
        desc="Attract relevant clients by sharing your strengths and abilities."
        isOpen={openSections.skills}
        onToggle={() => toggle('skills')}
        buttonLabel="Add skills and expertise"
      >
        <div className="pe-skill-input-row">
          <input
            className="pe-input"
            placeholder="e.g. Legal Research, SPSS, Essay Writing"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
          />
          <button className="pe-add-btn" onClick={addSkill}>+ Add</button>
        </div>
        <div className="pe-tags">
          {form.skills.map(s => (
            <span key={s} className="pe-tag">
              {s} <button onClick={() => removeSkill(s)}>×</button>
            </span>
          ))}
        </div>
      </SectionCard>

      {/* ── Work Experience ── */}
      <SectionCard
        title="Work experience"
        desc="Add your job history and achievements to give clients insight into your expertise."
        isOpen={openSections.work}
        onToggle={() => toggle('work')}
        buttonLabel="Add work experience"
        optional
      >
        <p className="pe-empty-hint">No work experience added yet.</p>
      </SectionCard>

      {/* ── Education + Certifications side by side ── */}
      <div className="pe-two-col">
        <SectionCard
          title="Education"
          desc="Back up your skills by adding any educational degrees or programs."
          isOpen={openSections.edu}
          onToggle={() => toggle('edu')}
          buttonLabel="Add education"
          optional
        >
          <p className="pe-empty-hint">No education added yet.</p>
        </SectionCard>

        <SectionCard
          title="Certifications"
          desc="Showcase your mastery with certifications earned in your field."
          isOpen={openSections.cert}
          onToggle={() => toggle('cert')}
          buttonLabel="Add certifications"
          optional
        >
          <p className="pe-empty-hint">No certifications added yet.</p>
        </SectionCard>
      </div>

      {/* ── Save button ── */}
      <div className="pe-save-bar">
        <button className="pe-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, desc, isOpen, onToggle, buttonLabel, optional, children }) {
  return (
    <div className="pe-section-card">
      <div className="pe-section-card__top">
        <div>
          <h3>{title} {optional && <span className="pe-optional">(Optional)</span>}</h3>
          <p>{desc}</p>
        </div>
        <div className="pe-section-card__right">
          <div className="pe-section-card__illustration" />
        </div>
      </div>
      {!isOpen
        ? <button className="pe-add-section-btn" onClick={onToggle}>+ {buttonLabel}</button>
        : <div className="pe-section-card__body">{children}</div>
      }
    </div>
  );
}