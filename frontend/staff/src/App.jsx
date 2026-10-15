
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard";
import WorkerDashboard from "./pages/WorkerDashboard.jsx";
import AdminDashboard from "./admin/AdminDashboard";
import { auth } from "./firebase";

export default function App() {
  const [user, setUser] = useState(undefined);
  const [view, setView] = useState("faculty");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

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

  if (user === undefined) {
    return <p style={{ padding: 24 }}>Checking sign-inâ€¦</p>;
  }

  if (!user) {
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
        <><button type="button" onClick={() => setView("worker")}>Worker</button><Login onLogin={() => {}} /></>
      </div>
    );
  }

  if (view === "worker") return <WorkerDashboard user={user} />;
  return <Dashboard staff={{ uid: user.uid, email: user.email }} />;
}

