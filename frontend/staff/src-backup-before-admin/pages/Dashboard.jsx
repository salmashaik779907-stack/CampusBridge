
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import RaiseComplaint from "./RaiseComplaint";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Clock3,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  const [page, setPage] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ticketsQuery = query(
      collection(db, "tickets"),
      where("userId", "==", user.uid)
    );

    return onSnapshot(
      ticketsQuery,
      (snapshot) => {
        setTickets(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => console.error("Could not load tickets:", error)
    );
  }, []);

  const openCount = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "RESOLVED"
  ).length;

  function navigate(nextPage) {
    setPage(nextPage);
    setMenuOpen(false);
  }

  async function handleLogout() {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    window.location.reload();
  }

  return (
    <div className="cb-layout">
      <aside className={`cb-sidebar ${menuOpen ? "cb-sidebar-open" : ""}`}>
        <div className="cb-brand">
          <img src="/ashoka%20logo.jpg" alt="Ashoka Women's Engineering College logo" />
          <div>
            <strong>CampusBridge</strong>
            <span>Faculty Portal</span>
          </div>
          <button
            className="cb-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cb-college-label">
          ASHOKA WOMEN'S ENGINEERING COLLEGE
        </div>

        <p className="cb-nav-label">WORKSPACE</p>

        <button
          className={`cb-nav-item ${page === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("dashboard")}
        >
          <LayoutDashboard size={19} />
          Dashboard
        </button>

        <button
          className={`cb-nav-item ${page === "raise" ? "active" : ""}`}
          onClick={() => navigate("raise")}
        >
          <PlusCircle size={19} />
          Raise Complaint
        </button>

        <button
          className={`cb-nav-item ${page === "tickets" ? "active" : ""}`}
          onClick={() => navigate("tickets")}
        >
          <ClipboardList size={19} />
          My Tickets
          <span className="cb-nav-count">{tickets.length}</span>
        </button>

        <div className="cb-sidebar-bottom">
          <div className="cb-user">
            <div className="cb-avatar">
              {(auth.currentUser?.email || "F").charAt(0).toUpperCase()}
            </div>
            <div className="cb-user-info">
              <strong>Faculty Member</strong>
              <span>{auth.currentUser?.email || "College staff"}</span>
            </div>
          </div>

          <button className="cb-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="cb-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="cb-main">
        <header className="cb-topbar">
          <button
            className="cb-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>
          <div>
            <span className="cb-topbar-overline">CAMPUSBRIDGE / FACULTY</span>
            <h2>
              {page === "dashboard"
                ? "Dashboard"
                : page === "raise"
                  ? "Raise a Complaint"
                  : "My Tickets"}
            </h2>
          </div>
          <div className="cb-topbar-badge">Faculty Portal</div>
        </header>

        {page === "raise" ? (
          <section className="cb-content">
            <div className="cb-welcome">
              <span className="cb-eyebrow">CAMPUS SUPPORT</span>
              <h1>How can we help you?</h1>
              <p>Describe the issue and let CampusBridge assist with routing it.</p>
            </div>
            <RaiseComplaint />
          </section>
        ) : page === "tickets" ? (
          <section className="cb-content">
            <div className="cb-welcome">
              <span className="cb-eyebrow">YOUR REQUESTS</span>
              <h1>My Tickets</h1>
              <p>Follow the progress of complaints you have submitted.</p>
            </div>
            <TicketList tickets={tickets} />
          </section>
        ) : (
          <section className="cb-content">
            <div className="cb-welcome">
              <div>
                <span className="cb-eyebrow">YOUR CAMPUS, CONNECTED</span>
                <h1>Welcome back!</h1>
                <p>Here's an overview of your campus complaints.</p>
              </div>
              <button
                className="cb-primary-button"
                onClick={() => navigate("raise")}
              >
                <PlusCircle size={18} />
                Raise Complaint
              </button>
            </div>

            <div className="cb-stat-grid">
              <StatCard
                label="Total Complaints"
                value={tickets.length}
                icon={<ClipboardList />}
                tone="maroon"
              />
              <StatCard
                label="Open"
                value={openCount}
                icon={<CircleAlert />}
                tone="yellow"
              />
              <StatCard
                label="In Progress"
                value={progressCount}
                icon={<Clock3 />}
                tone="blue"
              />
              <StatCard
                label="Resolved"
                value={resolvedCount}
                icon={<CheckCircle2 />}
                tone="green"
              />
            </div>

            <div className="cb-panel">
              <div className="cb-panel-header">
                <div>
                  <h3>Recent Complaints</h3>
                  <p>Your latest submitted campus issues</p>
                </div>
                <button
                  className="cb-text-button"
                  onClick={() => navigate("tickets")}
                >
                  View all
                </button>
              </div>
              <TicketList tickets={tickets.slice(0, 5)} />
            </div>

            <div className="cb-help-banner">
              <div className="cb-help-icon">
                <PlusCircle size={24} />
              </div>
              <div>
                <h3>Found a campus issue?</h3>
                <p>Submit a complaint and review the AI-suggested category.</p>
              </div>
              <button
                className="cb-secondary-button"
                onClick={() => navigate("raise")}
              >
                Get started
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="cb-stat-card">
      <div className={`cb-stat-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function TicketList({ tickets }) {
  if (!tickets.length) {
    return (
      <div className="cb-empty">
        <ClipboardList size={32} />
        <h3>No complaints yet</h3>
        <p>Your submitted complaints will appear here.</p>
      </div>
    );
  }

  return (
    <div className="cb-ticket-list">
      {tickets.map((ticket) => (
        <article className="cb-ticket-row" key={ticket.id}>
          <div className="cb-ticket-icon">
            <ClipboardList size={20} />
          </div>
          <div className="cb-ticket-details">
            <strong>{ticket.title || "Campus complaint"}</strong>
            <span>
              {ticket.ticketId || ticket.id} · {ticket.department || "Pending department"}
            </span>
          </div>
          <span
            className={`cb-status ${String(ticket.status || "OPEN")
              .toLowerCase()
              .replaceAll("_", "-")}`}
          >
            {String(ticket.status || "OPEN").replaceAll("_", " ")}
          </span>
        </article>
      ))}
    </div>
  );
}

export default Dashboard;
