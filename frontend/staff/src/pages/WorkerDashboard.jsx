import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function WorkerDashboard({ user }) {
  const [worker, setWorker] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("Loading assigned tasks...");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!user?.email) {
      setMessage("Please sign in with your worker account.");
      return;
    }

    const q = query(
      collection(db, "workers"),
      where("email", "==", user.email)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setWorker(null);
          setMessage("No worker profile matches this login email.");
          return;
        }

        const profile = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        };
        setWorker(profile);
        setMessage("");
      },
      () => setMessage("Could not load worker profile.")
    );
  }, [user?.email]);

  useEffect(() => {
    if (!worker?.id) return;

    const q = query(
      collection(db, "tickets"),
      where("assignedWorkerId", "==", worker.id)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        setTickets(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      () => setMessage("Could not load assigned tickets.")
    );
  }, [worker?.id]);

  async function updateTask(ticket, status) {
    setBusy(ticket.id);
    setMessage("");

    try {
      await updateDoc(doc(db, "tickets", ticket.id), {
        status,
        assignmentStatus: status,
        updatedAt: serverTimestamp(),
        ...(status === "COMPLETED"
          ? { resolvedDate: serverTimestamp() }
          : {}),
      });
      setMessage(`Ticket updated to ${status}.`);
    } catch {
      setMessage("Update failed. Please check your Firebase permissions.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main style={{ maxWidth: 850, margin: "30px auto", padding: 20 }}>
      <h1>Worker Dashboard</h1>
      <p>Signed in as: {user?.email}</p>
      {worker && <h2>{worker.name}</h2>}
      {message && <p role="status">{message}</p>}

      {tickets.map((ticket) => (
        <section
          key={ticket.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <h3>{ticket.title || "Campus issue"}</h3>
          <p>{ticket.description}</p>
          <p><b>Location:</b> {ticket.location || "Not specified"}</p>
          <p><b>Department:</b> {ticket.department || "Not specified"}</p>
          <p><b>Priority:</b> {ticket.priority || "Normal"}</p>
          <p><b>Status:</b> {ticket.status || "NEW"}</p>

          {ticket.status === "ASSIGNED" && (
            <button
              disabled={busy === ticket.id}
              onClick={() => updateTask(ticket, "IN_PROGRESS")}
            >
              Accept & Start Work
            </button>
          )}

          {ticket.status === "IN_PROGRESS" && (
            <button
              disabled={busy === ticket.id}
              onClick={() => updateTask(ticket, "COMPLETED")}
            >
              Mark Completed
            </button>
          )}
        </section>
      ))}
    </main>
  );
}
