// src/pages/profile/ProfileEdit.jsx
import { useState, useContext, useRef, useEffect } from 'react';
import AuthContext from '../../AuthContext';
import newRequest from '../../utils/newRequest';
import './ProfileEdit.scss';

const LANGUAGES = [
  'English', 'French', 'Spanish', 'German',
  'Arabic', 'Swahili', 'Portuguese', 'Chinese',
];

const COUNTRIES = [
  'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Uganda', 'Tanzania',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'India', 'Other',
];

// ─── Reusable section accordion ───────────────────────────────────────────────
function SectionCard({ title, desc, isOpen, onToggle, buttonLabel, optional, children }) {
  return (
    <div className="pe-section-card">
      <div className="pe-section-card__top">
        <div>
          <h3>{title} {optional && <span className="pe-optional">(Optional)</span>}</h3>
          <p>{desc}</p>
        </div>
        <button className="pe-add-section-btn" onClick={onToggle}>
          {isOpen ? '− Hide' : `+ ${buttonLabel}`}
        </button>
      </div>
      {isOpen && <div className="pe-section-card__body">{children}</div>}
    </div>
  );
}

// ─── Work Experience form ──────────────────────────────────────────────────────
function WorkExperienceForm({ items, onChange }) {
  const empty = { company: '', role: '', start: '', end: '', current: false, description: '' };

  const add    = () => onChange([...items, { ...empty }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="pe-list-form">
      {items.map((item, i) => (
        <div key={i} className="pe-list-item">
          <div className="pe-two-inputs">
            <div className="pe-field">
              <label>Company / Organisation</label>
              <input value={item.company} onChange={e => update(i, 'company', e.target.value)} placeholder="e.g. University of Nairobi" />
            </div>
            <div className="pe-field">
              <label>Role / Title</label>
              <input value={item.role} onChange={e => update(i, 'role', e.target.value)} placeholder="e.g. Research Assistant" />
            </div>
          </div>
          <div className="pe-two-inputs">
            <div className="pe-field">
              <label>Start Date</label>
              <input type="month" value={item.start} onChange={e => update(i, 'start', e.target.value)} />
            </div>
            <div className="pe-field">
              <label>End Date</label>
              <input type="month" value={item.end} disabled={item.current} onChange={e => update(i, 'end', e.target.value)} />
            </div>
          </div>
          <label className="pe-check-label">
            <input type="checkbox" checked={item.current} onChange={e => update(i, 'current', e.target.checked)} />
            I currently work here
          </label>
          <div className="pe-field">
            <label>Description</label>
            <textarea rows={3} value={item.description} onChange={e => update(i, 'description', e.target.value)} placeholder="Briefly describe your responsibilities…" />
          </div>
          <button className="pe-remove-btn" onClick={() => remove(i)}>− Remove</button>
        </div>
      ))}
      <button className="pe-add-btn" onClick={add}>+ Add Work Experience</button>
    </div>
  );
}

// ─── Education form ────────────────────────────────────────────────────────────
function EducationForm({ items, onChange }) {
  const empty = { institution: '', degree: '', field: '', year: '' };

  const add    = () => onChange([...items, { ...empty }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="pe-list-form">
      {items.map((item, i) => (
        <div key={i} className="pe-list-item">
          <div className="pe-field">
            <label>Institution</label>
            <input value={item.institution} onChange={e => update(i, 'institution', e.target.value)} placeholder="e.g. University of Nairobi" />
          </div>
          <div className="pe-two-inputs">
            <div className="pe-field">
              <label>Degree</label>
              <input value={item.degree} onChange={e => update(i, 'degree', e.target.value)} placeholder="e.g. BSc, MSc, PhD" />
            </div>
            <div className="pe-field">
              <label>Field of Study</label>
              <input value={item.field} onChange={e => update(i, 'field', e.target.value)} placeholder="e.g. Computer Science" />
            </div>
          </div>
          <div className="pe-field">
            <label>Graduation Year</label>
            <input type="number" min="1970" max="2030" value={item.year} onChange={e => update(i, 'year', e.target.value)} placeholder="e.g. 2022" />
          </div>
          <button className="pe-remove-btn" onClick={() => remove(i)}>− Remove</button>
        </div>
      ))}
      <button className="pe-add-btn" onClick={add}>+ Add Education</button>
    </div>
  );
}

// ─── Certifications form ───────────────────────────────────────────────────────
function CertificationsForm({ items, onChange }) {
  const empty = { name: '', issuer: '', year: '', url: '' };

  const add    = () => onChange([...items, { ...empty }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="pe-list-form">
      {items.map((item, i) => (
        <div key={i} className="pe-list-item">
          <div className="pe-two-inputs">
            <div className="pe-field">
              <label>Certification Name</label>
              <input value={item.name} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. Google Data Analytics" />
            </div>
            <div className="pe-field">
              <label>Issuing Organisation</label>
              <input value={item.issuer} onChange={e => update(i, 'issuer', e.target.value)} placeholder="e.g. Coursera / Google" />
            </div>
          </div>
          <div className="pe-two-inputs">
            <div className="pe-field">
              <label>Year Issued</label>
              <input type="number" min="2000" max="2030" value={item.year} onChange={e => update(i, 'year', e.target.value)} placeholder="e.g. 2023" />
            </div>
            <div className="pe-field">
              <label>Certificate URL (optional)</label>
              <input type="url" value={item.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <button className="pe-remove-btn" onClick={() => remove(i)}>− Remove</button>
        </div>
      ))}
      <button className="pe-add-btn" onClick={add}>+ Add Certification</button>
    </div>
  );
}

// ─── Main ProfileEdit ──────────────────────────────────────────────────────────
export default function ProfileEdit() {
  const { user, setUser } = useContext(AuthContext);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    displayName:    '',
    title:          '',
    country:        'Kenya',
    languages:      [],
    bio:            '',
    skills:         [],
    workExp:        [],
    education:      [],
    certifications: [],
  });

  const [avatarPreview, setAvatarPreview]   = useState(null);
  const [avatarFile, setAvatarFile]         = useState(null);
  const [skillInput, setSkillInput]         = useState('');
  const [openSections, setOpenSections]     = useState({
    about: false, skills: false, work: false, edu: false, cert: false,
  });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState(null);

  // Load existing profile on mount
  useEffect(() => {
    newRequest.get('/expert-profiles/me/').then(res => {
      const d = res.data;
      setForm({
        displayName:    d.username    || '',
        title:          d.title       || '',
        country:        d.country     || 'Kenya',
        languages:      d.languages   || [],
        bio:            d.bio         || '',
        skills:         d.skills      || [],
        workExp:        d.work_experience  || [],
        education:      d.education        || [],
        certifications: d.certifications   || [],
      });
      if (d.avatar_url) setAvatarPreview(d.avatar_url);
    }).catch(() => {/* not an expert or not logged in */});
  }, []);

  const toggle = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  // ── Skills ────────────────────────────────────────────────────────────────
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };
  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  // ── Languages ─────────────────────────────────────────────────────────────
  const toggleLanguage = (lang) => setForm(f => ({
    ...f,
    languages: f.languages.includes(lang)
      ? f.languages.filter(l => l !== lang)
      : [...f.languages, lang],
  }));

  // ── Avatar select ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // 1. Upload avatar if a new file was chosen
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await newRequest.post('/expert-profiles/me/avatar/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAvatarFile(null);
      }

      // 2. Patch all editable profile fields
      await newRequest.patch('/expert-profiles/me/', {
        bio:              form.bio,
        title:            form.title,
        country:          form.country,
        languages:        form.languages,
        skills:           form.skills,
        work_experience:  form.workExp,
        education:        form.education,
        certifications:   form.certifications,
      });

      // 3. Update display name on the user account (different endpoint)
      if (form.displayName && form.displayName !== user?.username) {
        await newRequest.patch('/users/me/', { username: form.displayName });
        setUser(prev => ({ ...prev, username: form.displayName }));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      const msg = e?.response?.data
        ? Object.values(e.response.data).flat().join(' ')
        : 'Failed to save. Please try again.';
      setError(msg);
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

      {/* ── Identity card ── */}
      <div className="pe-card">
        <div className="pe-identity">

          {/* Avatar */}
          <div className="pe-avatar-wrap" onClick={() => fileRef.current?.click()}>
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="pe-avatar-img" />
              : <div className="pe-avatar-placeholder">
                  <span>{form.displayName?.slice(0, 2).toUpperCase() || 'EX'}</span>
                </div>
            }
            <div className="pe-avatar-overlay">📷 Change</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          {/* Identity fields — inline inputs, no prompt() */}
          <div className="pe-identity-fields">
            <div className="pe-field">
              <label>Display Name</label>
              <input
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="Your full or display name"
              />
            </div>

            <div className="pe-field">
              <label>Professional Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Data Science Expert | PhD Statistics"
              />
            </div>

            <div className="pe-field">
              <label>Country</label>
              <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <SectionCard
        title="About"
        desc="Share your expertise, background, and what you offer to students."
        isOpen={openSections.about}
        onToggle={() => toggle('about')}
        buttonLabel="Add details"
      >
        <div className="pe-field">
          <label>Bio</label>
          <textarea
            className="pe-textarea"
            rows={5}
            placeholder="Describe your background and what makes you a great expert…"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          />
          <span className="pe-char-count">{form.bio.length} / 500</span>
        </div>

        <div className="pe-section-label">Languages</div>
        <div className="pe-lang-grid">
          {LANGUAGES.map(lang => (
            <label key={lang} className="pe-lang-check">
              <input
                type="checkbox"
                checked={form.languages.includes(lang)}
                onChange={() => toggleLanguage(lang)}
              />
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
        buttonLabel="Add skills"
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
        desc="Add your job history and achievements."
        isOpen={openSections.work}
        onToggle={() => toggle('work')}
        buttonLabel="Add work experience"
        optional
      >
        <WorkExperienceForm
          items={form.workExp}
          onChange={items => setForm(f => ({ ...f, workExp: items }))}
        />
      </SectionCard>

      {/* ── Education + Certifications ── */}
      <div className="pe-two-col">
        <SectionCard
          title="Education"
          desc="Add degrees or academic programmes you have completed."
          isOpen={openSections.edu}
          onToggle={() => toggle('edu')}
          buttonLabel="Add education"
          optional
        >
          <EducationForm
            items={form.education}
            onChange={items => setForm(f => ({ ...f, education: items }))}
          />
        </SectionCard>

        <SectionCard
          title="Certifications"
          desc="Showcase certifications earned in your field."
          isOpen={openSections.cert}
          onToggle={() => toggle('cert')}
          buttonLabel="Add certifications"
          optional
        >
          <CertificationsForm
            items={form.certifications}
            onChange={items => setForm(f => ({ ...f, certifications: items }))}
          />
        </SectionCard>
      </div>

      {/* ── Save bar ── */}
      {error && <div className="pe-error">{error}</div>}
      <div className="pe-save-bar">
        <button className="pe-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
setSaved(true);
setTimeout(() => navigate('/mygigs'), 1500);