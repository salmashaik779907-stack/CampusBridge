
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const API_URL = "http://127.0.0.1:8000";

const departments = [
  "IT Support",
  "Electrical",
  "Maintenance",
  "Housekeeping",
  "Administration",
];

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function RaiseComplaint() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      console.log(
        "Firebase login:",
        currentUser ? currentUser.uid : "NOT SIGNED IN"
      );
    });

    return unsubscribe;
  }, []);

  async function getRecommendation(event) {
    event.preventDefault();
    setMessage("");
    setTicketId("");
    setRecommendation(null);

    if (!title.trim() || !description.trim() || !location.trim()) {
      setMessage("Please fill in all three fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI backend returned HTTP ${response.status}.`);
      }

      const result = await response.json();
      console.log("AI response:", result);

      const nextCategory =
        result.category ??
        result.predicted_category ??
        result.issue_category;

      const nextDepartment =
        result.department ??
        result.predicted_department ??
        result.recommended_department;

      const nextPriority =
        result.priority ??
        result.predicted_priority ??
        result.recommended_priority;

      if (!nextCategory || !nextDepartment || !nextPriority) {
        throw new Error(
          "The AI response is missing category, department, or priority. Check the backend response in the Console."
        );
      }

      setCategory(nextCategory);
      setDepartment(nextDepartment);
      setPriority(nextPriority);
      setRecommendation({
        category: nextCategory,
        department: nextDepartment,
        priority: nextPriority,
      });
      setMessage("AI recommendation received. Please review it.");
    } catch (error) {
      console.error("AI recommendation failed:", error);
      setMessage(error.message || "Could not get the AI recommendation.");
    } finally {
      setLoading(false);
    }
  }

  async function createTicket() {
    setMessage("");
    setLoading(true);

    try {
      if (!authChecked) {
        throw new Error("Please wait while Firebase login is checked.");
      }

      if (!user) {
        throw new Error(
          "You are not signed in. Sign in through your Firebase login page before creating a ticket."
        );
      }

      if (!recommendation) {
        throw new Error("Get an AI recommendation first.");
      }

      if (!category.trim() || !department || !priority) {
        throw new Error("Please select category, department, and priority.");
      }

      // Read workers to confirm an available worker exists.
      // The current Firestore Rules require Firebase Authentication.
      let workerSnapshot;

      try {
        workerSnapshot = await getDocs(collection(db, "workers"));
      } catch (error) {
        console.error("WORKER READ FAILED:", error);
        throw new Error(
          "Could not read workers from Firestore. Check the workers rules."
        );
      }

      const availableWorkers = workerSnapshot.docs
        .map((workerDoc) => ({
          id: workerDoc.id,
          ...workerDoc.data(),
        }))
        .filter(
          (worker) =>
            worker.department === department &&
            worker.available === true &&
            worker.isDemo === true
        )
        .sort(
          (a, b) =>
            (a.activeTasks ?? 0) - (b.activeTasks ?? 0)
        );

      const selectedWorker = availableWorkers[0];

      if (!selectedWorker) {
        throw new Error(
          `No available demo worker was found in ${department}. Check the workers collection.`
        );
      }

      // Create the ticket. Do not update worker workload from the frontend.
      let ticketRef;

      try {
        ticketRef = await addDoc(collection(db, "tickets"), {
          userId: user.uid,
          userEmail: user.email ?? "",
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          category: category.trim(),
          department,
          priority,
          aiRecommendation: {
            category: recommendation.category,
            department: recommendation.department,
            priority: recommendation.priority,
          },
          verifiedByUser: true,
          assignedTo: selectedWorker.name ?? "",
          assignedWorkerId: selectedWorker.id,
          assignedWorkerEmail: selectedWorker.email ?? "",
          assignmentStatus: "ASSIGNED",
          status: "NEW",
          adminResponse: "",
          dueDate: null,
          resolvedDate: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("TICKET CREATION FAILED:", error);
        throw new Error(
          "Could not create the ticket. Check the tickets rules and Firebase login."
        );
      }

      setTicketId(ticketRef.id);
      setMessage(
        "Ticket created successfully. Worker workload was not changed."
      );
    } catch (error) {
      console.error("TICKET SUBMISSION FAILED:", error);
      setMessage(error.message || "Ticket submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.heading}>CampusBridge</h1>
        <h2 style={styles.subheading}>Raise a Campus Issue</h2>
        <p style={styles.description}>
          AI recommends. You verify. The system tracks.
        </p>

        <div
          style={{
            ...styles.loginStatus,
            background: !authChecked
              ? "#fef3c7"
              : user
                ? "#dcfce7"
                : "#fee2e2",
          }}
        >
          {!authChecked
            ? "Checking Firebase login..."
            : user
              ? `Signed in${user.email ? `: ${user.email}` : ""}`
              : "Not signed in with Firebase"}
        </div>

        <form onSubmit={getRecommendation}>
          <label style={styles.label} htmlFor="title">
            Complaint title
          </label>
          <input
            id="title"
            style={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Projector not working"
            required
          />

          <label style={styles.label} htmlFor="description">
            Describe the issue
          </label>
          <textarea
            id="description"
            style={styles.textarea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain the problem"
            rows={4}
            required
          />

          <label style={styles.label} htmlFor="location">
            Location
          </label>
          <input
            id="location"
            style={styles.input}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Example: Block A, Room 204"
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Get AI Recommendation"}
          </button>
        </form>

        {recommendation && (
          <section style={styles.recommendation}>
            <h3>Review AI Recommendation</h3>

            <label style={styles.label} htmlFor="category">
              Category
            </label>
            <input
              id="category"
              style={styles.input}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />

            <label style={styles.label} htmlFor="department">
              Department
            </label>
            <select
              id="department"
              style={styles.input}
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              {!departments.includes(department) && (
                <option value={department}>{department}</option>
              )}
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label style={styles.label} htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              style={styles.input}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {!priorities.includes(priority) && (
                <option value={priority}>{priority}</option>
              )}
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              style={styles.button}
              disabled={loading}
              onClick={createTicket}
            >
              {loading ? "Submitting..." : "Verify and Create Ticket"}
            </button>
          </section>
        )}

        {message && <p role="status" style={styles.message}>{message}</p>}

        {ticketId && (
          <section style={styles.ticket}>
            <h3>Ticket Created!</h3>
            <p>Your ticket ID is:</p>
            <strong>{ticketId}</strong>
            <p>Save this ID for tracking your complaint.</p>
          </section>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #111827, #312e81, #6d28d9)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    maxWidth: 680,
    margin: "0 auto",
    padding: 28,
    boxSizing: "border-box",
    background: "#ffffff",
    borderRadius: 18,
    boxShadow: "0 15px 45px rgba(0,0,0,0.25)",
  },
  heading: {
    margin: 0,
    color: "#4f46e5",
    fontSize: 30,
  },
  subheading: {
    marginBottom: 8,
    color: "#111827",
  },
  description: {
    color: "#6b7280",
    lineHeight: 1.6,
  },
  loginStatus: {
    margin: "18px 0",
    padding: 12,
    borderRadius: 8,
    color: "#374151",
    overflowWrap: "anywhere",
  },
  label: {
    display: "block",
    marginTop: 16,
    marginBottom: 7,
    color: "#374151",
    fontWeight: 700,
    fontSize: 14,
  },
  input: {
    width: "100%",
    minHeight: 44,
    padding: 11,
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#ffffff",
    color: "#111827",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    padding: 11,
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    color: "#111827",
    fontSize: 14,
  },
  button: {
    width: "100%",
    marginTop: 20,
    padding: 13,
    border: 0,
    borderRadius: 9,
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  recommendation: {
    marginTop: 24,
    padding: 18,
    border: "1px solid #ddd6fe",
    borderRadius: 12,
    background: "#faf9ff",
  },
  message: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    background: "#f3f4f6",
    color: "#374151",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
  ticket: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    background: "#dcfce7",
    color: "#166534",
    overflowWrap: "anywhere",
  },
};
