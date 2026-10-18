
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard";
import WorkerDashboard from "./pages/WorkerDashboard.jsx";
import AdminDashboard from "./admin/AdminDashboard";
import { auth } from "./firebase";

const navButton = (active) => ({
  border: "1px solid",
  borderColor: active ? "#4338ca" : "#e2e8f0",
  background: active ? "#eef2ff" : "#ffffff",
  color: active ? "#3730a3" : "#334155",
  borderRadius: "10px",
  padding: "9px 15px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "Inter, system-ui, sans-serif",
  cursor: "pointer",
  transition: "all 0.2s ease",
});

export default function App() {
  const [user, setUser] = useState(undefined);
  const [view, setView] = useState("faculty");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (user === undefined && view !== "admin") {
    return (
      <p style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
        Checking sign-in...
      </p>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#f8fafc",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "14px 24px",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div>
          <div
            style={{
              color: "#312e81",
              fontSize: 20,
              fontWeight: 750,
              letterSpacing: "-0.5px",
            }}
          >
            CampusBridge
          </div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>
            Smart Campus Issue Management
          </div>
        </div>

        <nav
          aria-label="Dashboard navigation"
          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          <button
            type="button"
            style={navButton(view === "faculty")}
            onClick={() => setView("faculty")}
          >
            Faculty
          </button>

          <button
            type="button"
            style={navButton(view === "worker")}
            onClick={() => setView("worker")}
          >
            Worker
          </button>

          <button
            type="button"
            style={navButton(view === "admin")}
            onClick={() => setView("admin")}
          >
            Admin
          </button>
        </nav>
      </header>

      <main>
        {view === "admin" ? (
          <AdminDashboard />
        ) : view === "worker" ? (
          user ? (
            <WorkerDashboard user={user} />
          ) : (
            <Login onLogin={() => {}} />
          )
        ) : user ? (
          <Dashboard staff={{ uid: user.uid, email: user.email }} />
        ) : (
          <Login onLogin={() => {}} />
        )}
      </main>
    </div>
  );
}
