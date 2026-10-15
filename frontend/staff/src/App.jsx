
import { useState } from "react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./admin/AdminDashboard";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [staff, setStaff] = useState(null);
  const [view, setView] = useState("faculty");

  function handleLogin(credentials) {
    setStaff(credentials);
    setLoggedIn(true);
  }

  if (view === "admin") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setView("faculty")}
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 9999,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Back to Faculty
        </button>

        <AdminDashboard />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setView("admin")}
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 9999,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Admin
        </button>

        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return <Dashboard staff={staff} />;
}
