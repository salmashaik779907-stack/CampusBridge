
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [staff, setStaff] = useState(null);

  function handleLogin(credentials) {
    setStaff(credentials);
    setLoggedIn(true);
  }

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard staff={staff} />;
}
