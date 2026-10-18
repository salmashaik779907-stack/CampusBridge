
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./WorkerDashboard.css";

export default function WorkerDashboard({ user }) {
  const [worker, setWorker] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("Loading assigned tasks...");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let unsubscribers = [];
    let cancelled = false;

    function listenForTickets(workerId, workerEmail) {
      const ticketsRef = collection(db, "tickets");
      const ticketQueries = [
        query(ticketsRef, where("assignedWorkerId", "==", workerId)),
      ];

      if (workerEmail) {
        ticketQueries.push(
          query(
            ticketsRef,
            where("assignedWorkerEmail", "==", workerEmail)
          )
        );
      }

      const latestByQuery = new Map();

      unsubscribers = ticketQueries.map((ticketQuery, index) =>
        onSnapshot(
          ticketQuery,
          (snapshot) => {
            if (cancelled) return;

            latestByQuery.set(
              index,
              snapshot.docs.map((ticketDoc) => ({
                id: ticketDoc.id,
                ...ticketDoc.data(),
              }))
            );

            const merged = new Map();

            latestByQuery.forEach((list) => {
              list.forEach((ticket) => merged.set(ticket.id, ticket));
            });

            setTickets(Array.from(merged.values()));
            setMessage("");
          },
          (error) => {
            console.error("Ticket loading error:", error);

            if (!cancelled) {
              setMessage(
                "Unable to load tickets. Check Firestore access."
              );
            }
          }
        )
      );
    }

    async function loadWorker() {
      if (!user?.email) {
        setWorker(null);
        setTickets([]);
        setMessage("Please log in to view your assigned tasks.");
        return;
      }

      try {
        setMessage("Loading your worker profile...");

        const workerQuery = query(
          collection(db, "workers"),
          where("email", "==", user.email)
        );

        const workerSnapshot = await getDocs(workerQuery);

        if (cancelled) return;

        let workerDoc = workerSnapshot.empty
          ? null
          : workerSnapshot.docs.find(
              (item) =>
                (item.data().email || "").toLowerCase() ===
                user.email.toLowerCase()
            ) || workerSnapshot.docs[0];

        if (!workerDoc && user.uid) {
          const uidDoc = await getDoc(doc(db, "workers", user.uid));

          if (cancelled) return;

          if (uidDoc.exists()) workerDoc = uidDoc;
        }

        if (!workerDoc) {
          setWorker(null);
          setTickets([]);
          setMessage(
            "No worker profile matches your login email. Check the email in the workers collection."
          );
          return;
        }

        const workerData = {
          id: workerDoc.id,
          ...workerDoc.data(),
        };

        setWorker(workerData);

        // Listen using the actual worker document ID and the
        // signed-in email to support either assignment field.
        listenForTickets(workerDoc.id, user.email);
      } catch (error) {
        console.error("Worker loading error:", error);

        if (!cancelled) {
          setMessage(
            "Unable to load your worker profile. Check Firestore access."
          );
        }
      }
    }

    loadWorker();

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user?.email, user?.uid]);

  const updateStatus = async (ticket, nextStatus) => {
    try {
      setBusy(ticket.id);

      await updateDoc(doc(db, "tickets", ticket.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Status update error:", error);
      alert(
        `Could not update the ticket: ${error.message || "Please try again."}`
      );
    } finally {
      setBusy("");
    }
  };

  const getStatusClass = (status = "NEW") =>
    status.toLowerCase().replaceAll("_", "-");

  const pendingCount = tickets.filter(
    (ticket) => !["COMPLETED", "CLOSED"].includes(ticket.status)
  ).length;

  const completedCount = tickets.filter(
    (ticket) => ticket.status === "COMPLETED"
  ).length;

  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  return (
    <main className="worker-page">
      <div className="worker-content">
        <header className="worker-header">
          <div>
            <p className="worker-eyebrow">CAMPUSBRIDGE • STAFF PORTAL</p>
            <h1>Worker Dashboard</h1>
            <p className="worker-subtitle">
              Manage your assigned campus issues and track your progress.
            </p>
          </div>

          <div className="worker-profile">
            <div className="worker-avatar">
              {(worker?.name || user?.displayName || user?.email || "W")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <strong>
                {worker?.name || user?.displayName || "Campus Worker"}
              </strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        <section className="worker-stats">
          <article className="worker-stat">
            <span className="stat-icon blue">▣</span>
            <div>
              <p>Total Assigned</p>
              <h2>{tickets.length}</h2>
            </div>
          </article>

          <article className="worker-stat">
            <span className="stat-icon orange">◷</span>
            <div>
              <p>Pending Tasks</p>
              <h2>{pendingCount}</h2>
            </div>
          </article>

          <article className="worker-stat">
            <span className="stat-icon purple">↻</span>
            <div>
              <p>In Progress</p>
              <h2>{inProgressCount}</h2>
            </div>
          </article>

          <article className="worker-stat">
            <span className="stat-icon green">✓</span>
            <div>
              <p>Completed</p>
              <h2>{completedCount}</h2>
            </div>
          </article>
        </section>

        <section className="worker-tasks-section">
          <div className="worker-section-heading">
            <div>
              <h2>My Assigned Tasks</h2>
              <p>Review issue details and update task status.</p>
            </div>
            <span className="task-count">{tickets.length} tasks</span>
          </div>

          {message && <div className="worker-message">{message}</div>}

          {!message && tickets.length === 0 && (
            <div className="worker-empty">
              <div className="empty-icon">✓</div>
              <h3>No tasks assigned yet</h3>
              <p>
                Your worker profile was found, but no tickets are assigned
                to it yet.
              </p>
            </div>
          )}

          <div className="worker-ticket-grid">
            {tickets.map((ticket) => {
              const status = ticket.status || "NEW";
              const isBusy = busy === ticket.id;

              return (
                <article className="worker-ticket" key={ticket.id}>
                  <div className="ticket-topline">
                    <span className="ticket-id">
                      #{ticket.ticketNumber || ticket.id.slice(0, 8)}
                    </span>
                    <span
                      className={
                        "ticket-status " + getStatusClass(status)
                      }
                    >
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <h3>{ticket.title || ticket.subject || "Campus Issue"}</h3>

                  <p className="ticket-description">
                    {ticket.description ||
                      "No additional description provided."}
                  </p>

                  <div className="ticket-details">
                    <div>
                      <span>Category</span>
                      <strong>{ticket.category || "General"}</strong>
                    </div>
                    <div>
                      <span>Priority</span>
                      <strong
                        className={
                          "priority-" +
                          (ticket.priority || "medium").toLowerCase()
                        }
                      >
                        {ticket.priority || "Medium"}
                      </strong>
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>
                        {ticket.location || ticket.room || "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    {status === "ASSIGNED" && (
                      <button
                        className="worker-button primary"
                        disabled={isBusy}
                        onClick={() => updateStatus(ticket, "IN_PROGRESS")}
                      >
                        {isBusy ? "Updating..." : "Start Task →"}
                      </button>
                    )}

                    {status === "IN_PROGRESS" && (
                      <button
                        className="worker-button success"
                        disabled={isBusy}
                        onClick={() => updateStatus(ticket, "COMPLETED")}
                      >
                        {isBusy ? "Updating..." : "✓ Mark Completed"}
                      </button>
                    )}

                    {["COMPLETED", "CLOSED"].includes(status) && (
                      <span className="completed-label">
                        ✓ Task finished
                      </span>
                    )}

                    {![
                      "ASSIGNED",
                      "IN_PROGRESS",
                      "COMPLETED",
                      "CLOSED",
                    ].includes(status) && (
                      <span className="ticket-waiting">
                        Awaiting assignment or admin update
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
