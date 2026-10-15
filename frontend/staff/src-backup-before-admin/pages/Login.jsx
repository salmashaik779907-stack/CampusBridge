
import { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (staffId.trim() && password.trim()) {
      onLogin?.({ staffId: staffId.trim() });
    }
  }

  return (
    <main className="cb-login-page">
      <div className="cb-background-overlay" />

      <header className="cb-topbar">
        <img
          className="cb-college-logo"
          src="/ashoka%20logo.jpg"
          alt="Ashoka Women's Engineering College logo"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <div className="cb-topbar-text">
          <span className="cb-college-title">
            ASHOKA WOMEN'S ENGINEERING COLLEGE
          </span>
          <span className="cb-topbar-subtitle">
            Campus Services Portal
          </span>
        </div>
      </header>

      <div className="cb-login-layout">
        <section className="cb-welcome-panel">
          <span className="cb-welcome-label">
            SMART CAMPUS • BETTER SERVICE
          </span>

          <h1>
            Every campus
            <br />
            issue deserves
            <br />
            <span>a solution.</span>
          </h1>

          <p>
            Report campus issues, follow their progress, and
            help create a better campus experience for everyone.
          </p>

          <div className="cb-feature-list">
            <div className="cb-feature">
              <span className="cb-feature-icon">01</span>
              <div>
                <strong>Raise an issue</strong>
                <span>Report problems in a few simple steps.</span>
              </div>
            </div>

            <div className="cb-feature">
              <span className="cb-feature-icon">02</span>
              <div>
                <strong>Track progress</strong>
                <span>Stay informed about complaint status.</span>
              </div>
            </div>

            <div className="cb-feature">
              <span className="cb-feature-icon">03</span>
              <div>
                <strong>Improve campus life</strong>
                <span>Help teams respond more effectively.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="cb-login-card">
          <div className="cb-card-emblem">CB</div>

          <p className="cb-card-eyebrow">FACULTY & STAFF ACCESS</p>
          <h2>Welcome back</h2>
          <p className="cb-card-description">
            Sign in to access your CampusBridge workspace.
          </p>

          <form onSubmit={handleSubmit} className="cb-login-form">
            <label htmlFor="staffId">Staff ID</label>
            <input
              id="staffId"
              type="text"
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              placeholder="Enter your Staff ID"
              autoComplete="username"
              required
            />

            <div className="cb-password-label">
              <label htmlFor="password">Password</label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button className="cb-login-button" type="submit">
              Sign in to CampusBridge <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="cb-card-footer">
            <span className="cb-status-dot" />
            Campus issue management system
          </div>

          <p className="cb-prototype-note">
            Prototype access: any non-empty Staff ID and password
            are accepted. Authentication is not yet connected.
          </p>
        </section>
      </div>

      <footer className="cb-page-footer">
        <span>CampusBridge</span>
        <span>AI recommends. Humans verify. The system tracks.</span>
      </footer>
    </main>
  );
}
