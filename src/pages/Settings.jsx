
import { useState } from "react";
import {
  Bell,
  Check,
  Globe,
  LockKeyhole,
  Palette,
  Save,
  UserRound,
} from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "Shahab Ebrahimi",
    email: "shahab@example.com",
    company: "NexaPanel",
    timezone: "Asia/Tehran",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderUpdates: true,
    weeklyReport: false,
  });

  const [saved, setSaved] = useState(false);

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function updatePreference(field) {
    setPreferences((current) => ({
      ...current,
      [field]: !current[field],
    }));
    setSaved(false);
  }

  function saveSettings(event) {
    event.preventDefault();

    localStorage.setItem("nexapanel-profile", JSON.stringify(profile));
    localStorage.setItem(
      "nexapanel-notifications",
      JSON.stringify(preferences),
    );

    setSaved(true);
  }

  return (
    <section className="page-content settings-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">PREFERENCES</p>
          <h2>Settings</h2>
          <p className="page-description">
            Manage your profile and dashboard preferences.
          </p>
        </div>
      </div>

      <form className="settings-layout" onSubmit={saveSettings}>
        <div className="settings-main">
          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <UserRound size={19} />
              </div>
              <div>
                <h3>Profile information</h3>
                <p>Update your account details.</p>
              </div>
            </div>

            <div className="settings-fields">
              <label className="settings-field">
                <span>Full name</span>
                <input
                  value={profile.name}
                  onChange={(event) =>
                    updateProfile("name", event.target.value)
                  }
                  required
                />
              </label>

              <label className="settings-field">
                <span>Email address</span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    updateProfile("email", event.target.value)
                  }
                  required
                />
              </label>

              <label className="settings-field">
                <span>Company name</span>
                <input
                  value={profile.company}
                  onChange={(event) =>
                    updateProfile("company", event.target.value)
                  }
                  required
                />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <Bell size={19} />
              </div>
              <div>
                <h3>Notifications</h3>
                <p>Choose which updates you want to receive.</p>
              </div>
            </div>

            <div className="settings-options">
              <label className="settings-option">
                <span className="settings-option-copy">
                  <strong>Email notifications</strong>
                  <small>Receive important updates by email.</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => updatePreference("emailNotifications")}
                />
              </label>

              <label className="settings-option">
                <span className="settings-option-copy">
                  <strong>Order updates</strong>
                  <small>Get notified about order activity.</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={() => updatePreference("orderUpdates")}
                />
              </label>

              <label className="settings-option">
                <span className="settings-option-copy">
                  <strong>Weekly report</strong>
                  <small>Receive a weekly performance summary.</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReport}
                  onChange={() => updatePreference("weeklyReport")}
                />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <Globe size={19} />
              </div>
              <div>
                <h3>Regional preferences</h3>
                <p>Configure your dashboard time zone.</p>
              </div>
            </div>

            <label className="settings-field">
              <span>Time zone</span>
              <select
                value={profile.timezone}
                onChange={(event) =>
                  updateProfile("timezone", event.target.value)
                }
              >
                <option value="Asia/Tehran">Tehran (UTC+03:30)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Berlin">Berlin</option>
                <option value="America/New_York">New York</option>
                <option value="Asia/Dubai">Dubai</option>
              </select>
            </label>
          </section>
        </div>

        <aside className="settings-side">
          <section className="settings-card settings-appearance-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <Palette size={19} />
              </div>
              <div>
                <h3>Appearance</h3>
                <p>Personalize your workspace.</p>
              </div>
            </div>

            <div className="settings-info-row">
              <span>Theme</span>
              <span className="settings-info-value">Managed in header</span>
            </div>
            <p className="settings-helper">
              Use the sun or moon button in the top navigation to switch
              between light and dark mode.
            </p>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <LockKeyhole size={19} />
              </div>
              <div>
                <h3>Account security</h3>
                <p>Keep your account protected.</p>
              </div>
            </div>

            <p className="settings-helper">
              This demo stores preferences in your browser. Account security
              features require a backend service.
            </p>
          </section>

          <div className="settings-save-area">
            <button type="submit" className="primary-action-button">
              {saved ? <Check size={17} /> : <Save size={17} />}
              <span>{saved ? "Settings saved" : "Save settings"}</span>
            </button>

            {saved && (
              <p className="settings-save-message" role="status">
                Your preferences were saved in this browser.
              </p>
            )}
          </div>
        </aside>
      </form>
    </section>
  );
}
