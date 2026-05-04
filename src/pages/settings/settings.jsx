import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import newRequest from "../../utils/newRequest";
import "./settings.scss";

/* ─── small helpers ─────────────────────────────────────────── */
const Panel = ({ id, active, children }) => (
  <div className={`settings-panel${active === id ? " active" : ""}`}>
    {children}
  </div>
);

const SaveBtn = ({ loading }) => (
  <button className="save-btn" type="submit" disabled={loading}>
    {loading ? "Saving…" : "Save changes"}
  </button>
);

/* ─── component ──────────────────────────────────────────────── */
export default function Settings() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const isExpert = currentUser?.user_type === "expert";

  const [activePanel, setActivePanel] = useState("profile");

  /* profile */
  const [profile, setProfile] = useState({
    username:   "",
    email:      "",
    first_name: "",
    last_name:  "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg]         = useState(null); // {ok, text}

  /* password */
  const [pw, setPw]           = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg]         = useState(null);

  /* expert availability */
  const [expertData, setExpertData]         = useState({ available: false, bio: "", field_of_study: "" });
  const [expertLoading, setExpertLoading]   = useState(false);
  const [expertMsg, setExpertMsg]           = useState(null);

  /* ── load profile on mount ── */
  useEffect(() => {
    newRequest.get("/users/me/").then(({ data }) => {
      setProfile({
        username:   data.username   ?? "",
        email:      data.email      ?? "",
        first_name: data.first_name ?? "",
        last_name:  data.last_name  ?? "",
      });
    }).catch(console.error);

    if (isExpert) {
      newRequest.get("/expert-profiles/").then(({ data }) => {
        // endpoint returns a list; find the one that matches the current user
        const me = Array.isArray(data)
          ? data.find(p => p.username === currentUser?.username)
          : data;
        if (me) setExpertData({
          available:     me.available,
          bio:           me.bio           ?? "",
          field_of_study: me.field_of_study ?? "",
        });
      }).catch(console.error);
    }
  }, [isExpert, currentUser?.username]);

  /* ── save profile ── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { data } = await newRequest.patch("/users/me/", profile);
      setProfileMsg({ ok: true, text: "Profile saved!" });
      // keep AuthContext in sync
      setCurrentUser(prev => ({ ...prev, username: data.username, email: data.email }));
    } catch (err) {
      const detail = err?.response?.data;
      const text = typeof detail === "string"
        ? detail
        : Object.values(detail ?? {}).flat().join(" ") || "Something went wrong.";
      setProfileMsg({ ok: false, text });
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── save password ── */
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: "New passwords don't match." });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const { data } = await newRequest.post("/users/change-password/", {
        current_password: pw.current,
        new_password:     pw.next,
      });
      // rotate the stored token so subsequent requests still work
      if (data.token) {
        const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
        stored.token = data.token;
        localStorage.setItem("currentUser", JSON.stringify(stored));
        setCurrentUser(prev => ({ ...prev, token: data.token }));
      }
      setPwMsg({ ok: true, text: "Password changed!" });
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      const detail = err?.response?.data;
      const text = typeof detail === "string"
        ? detail
        : Object.values(detail ?? {}).flat().join(" ") || "Something went wrong.";
      setPwMsg({ ok: false, text });
    } finally {
      setPwLoading(false);
    }
  };

  /* ── save expert availability ── */
  const handleExpertSave = async (e) => {
    e.preventDefault();
    setExpertLoading(true);
    setExpertMsg(null);
    try {
      await newRequest.patch("/expert-profiles/me/", expertData);
      setExpertMsg({ ok: true, text: "Availability updated!" });
    } catch (err) {
      const detail = err?.response?.data;
      const text = typeof detail === "string"
        ? detail
        : Object.values(detail ?? {}).flat().join(" ") || "Something went wrong.";
      setExpertMsg({ ok: false, text });
    } finally {
      setExpertLoading(false);
    }
  };

  /* ── render ── */
  return (
    <div className="settings">
      <div className="settings-container">
        <h1>Settings</h1>

        {/* sidebar nav */}
        <div className="settings-layout">
          <nav className="settings-nav">
            {[
              { id: "profile",  label: "Profile" },
              { id: "security", label: "Password" },
              ...(isExpert ? [{ id: "expert", label: "Expert tools" }] : []),
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`nav-item${activePanel === id ? " active" : ""}`}
                onClick={() => setActivePanel(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* ── Profile panel ── */}
          <Panel id="profile" active={activePanel}>
            <h2>Profile information</h2>
            <form onSubmit={handleProfileSave}>
              <div className="form-row">
                <label>First name
                  <input
                    value={profile.first_name}
                    onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))}
                    placeholder="First name"
                  />
                </label>
                <label>Last name
                  <input
                    value={profile.last_name}
                    onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))}
                    placeholder="Last name"
                  />
                </label>
              </div>
              <label>Username
                <input
                  value={profile.username}
                  onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                  placeholder="Username"
                />
              </label>
              <label>Email
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                />
              </label>
              {profileMsg && (
                <p className={`msg ${profileMsg.ok ? "ok" : "err"}`}>{profileMsg.text}</p>
              )}
              <SaveBtn loading={profileLoading} />
            </form>
          </Panel>

          {/* ── Password panel ── */}
          <Panel id="security" active={activePanel}>
            <h2>Change password</h2>
            <form onSubmit={handlePasswordSave}>
              <label>Current password
                <input
                  type="password"
                  value={pw.current}
                  onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                  placeholder="Current password"
                  required
                />
              </label>
              <label>New password
                <input
                  type="password"
                  value={pw.next}
                  onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>
              <label>Confirm new password
                <input
                  type="password"
                  value={pw.confirm}
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  required
                />
              </label>
              {pwMsg && (
                <p className={`msg ${pwMsg.ok ? "ok" : "err"}`}>{pwMsg.text}</p>
              )}
              <SaveBtn loading={pwLoading} />
            </form>
          </Panel>

          {/* ── Expert tools panel (only visible for experts) ── */}
          {isExpert && (
            <Panel id="expert" active={activePanel}>
              <h2>Expert tools</h2>
              <form onSubmit={handleExpertSave}>
                <label className="toggle-row">
                  <span>Available for new orders</span>
                  <input
                    type="checkbox"
                    checked={expertData.available}
                    onChange={e => setExpertData(p => ({ ...p, available: e.target.checked }))}
                  />
                </label>
                <label>Field of study
                  <input
                    value={expertData.field_of_study}
                    onChange={e => setExpertData(p => ({ ...p, field_of_study: e.target.value }))}
                    placeholder="e.g. Computer Science"
                  />
                </label>
                <label>Bio
                  <textarea
                    rows={4}
                    value={expertData.bio}
                    onChange={e => setExpertData(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell students a bit about yourself…"
                  />
                </label>
                {expertMsg && (
                  <p className={`msg ${expertMsg.ok ? "ok" : "err"}`}>{expertMsg.text}</p>
                )}
                <SaveBtn loading={expertLoading} />
              </form>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}