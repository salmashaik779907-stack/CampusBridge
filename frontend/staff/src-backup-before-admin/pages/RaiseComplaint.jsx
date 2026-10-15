import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

function RaiseComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [verified, setVerified] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);

  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("");

  const [ticket, setTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);
    setVerified(false);
    setEditing(false);
    setTicket(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaint: `${title}. ${description}. Location: ${location}`,
        }),
      });

      if (!response.ok) {
        throw new Error("AI API request failed");
      }

      const data = await response.json();

      setResult(data);
      setCategory(data.category);
      setDepartment(data.department);
      setPriority(data.priority);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to CampusBridge AI. Please make sure the AI API is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptRecommendation = () => {
    setVerified(true);
    setEditing(false);
  };

  const startEditing = () => {
    setEditing(true);
    setVerified(false);
  };

  const saveChanges = () => {
    setVerified(true);
    setEditing(false);
  };

  const createTicket = async () => {
    setSavingTicket(true);
    setError("");

    try {
      const ticketId = `CB-${Date.now().toString().slice(-6)}`;

      const newTicket = {
        ticketId,
        userId: "demo-staff-user",
        title,
        description,
        location,
        category,
        department,
        priority,
        aiRecommendation: {
          category: result?.category || category,
          department: result?.department || department,
          priority: result?.priority || priority,
        },
        aiConfidence: {
          category: result?.category_confidence || 0,
          department: result?.department_confidence || 0,
          priority: result?.priority_confidence || 0,
        },
        verifiedByUser: true,
        assignedTo: "",
        status: "OPEN",
        adminResponse: "",
        dueDate: null,
        resolvedDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "tickets"), newTicket);

      setTicket({
        ...newTicket,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Firebase ticket creation error:", error);
      setError(
        "Unable to create ticket in Firebase. Please check your Firebase connection and Firestore rules."
      );
    } finally {
      setSavingTicket(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setResult(null);
    setVerified(false);
    setEditing(false);
    setTicket(null);
    setError("");
    setCategory("");
    setDepartment("");
    setPriority("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>CB</div>
          <div>
            <h1 style={styles.heading}>Raise New Complaint</h1>
            <p style={styles.subtitle}>
              Report a campus issue for AI-assisted classification
            </p>
          </div>
        </div>

        {!ticket && (
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Complaint Title</label>
            <input
              type="text"
              placeholder="Example: Projector is not working"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              required
            />

            <label style={styles.label}>Description</label>
            <textarea
              placeholder="Describe the issue clearly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              required
            />

            <label style={styles.label}>Location</label>
            <input
              type="text"
              placeholder="Example: Block A, Room 204"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.input}
              required
            />

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Complaint with AI"}
            </button>
          </form>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {result && !ticket && (
          <div style={styles.result}>
            <h2 style={styles.resultTitle}>AI Recommendation</h2>
            <p style={styles.recommendationText}>
              The AI has analyzed your complaint. Review the recommendation
              before creating the ticket.
            </p>

            {!editing && (
              <>
                <div style={styles.resultRow}>
                  <strong>Category</strong>
                  <span>{category}</span>
                </div>
                <div style={styles.resultRow}>
                  <strong>Department</strong>
                  <span>{department}</span>
                </div>
                <div style={styles.resultRow}>
                  <strong>Priority</strong>
                  <span>{priority}</span>
                </div>
              </>
            )}

            {editing && (
              <div style={styles.editBox}>
                <h3 style={styles.editTitle}>Edit AI Recommendation</h3>

                <label style={styles.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.input}
                >
                  <option>Classroom</option>
                  <option>Electrical</option>
                  <option>IT / Computer</option>
                  <option>Internet / Wi-Fi</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                  <option>Projector / Smart Board</option>
                </select>

                <label style={styles.label}>Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={styles.input}
                >
                  <option>IT Support</option>
                  <option>Electrical</option>
                  <option>Maintenance</option>
                  <option>Housekeeping</option>
                  <option>Administration</option>
                </select>

                <label style={styles.label}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={styles.input}
                >
                  <option>HIGH</option>
                  <option>MEDIUM</option>
                  <option>LOW</option>
                </select>

                <button
                  type="button"
                  onClick={saveChanges}
                  style={styles.saveButton}
                >
                  Save &amp; Verify
                </button>
              </div>
            )}

            {!verified && !editing && (
              <div style={styles.verificationBox}>
                <h3 style={styles.verificationTitle}>
                  Human Verification Required
                </h3>
                <p style={styles.verificationText}>
                  AI recommends these values. A staff member must verify them
                  before creating the ticket.
                </p>
                <button
                  type="button"
                  onClick={acceptRecommendation}
                  style={styles.acceptButton}
                >
                  ✓ Accept AI Recommendation
                </button>
                <button
                  type="button"
                  onClick={startEditing}
                  style={styles.editButton}
                >
                  ✎ Edit Recommendation
                </button>
              </div>
            )}

            {verified && (
              <div style={styles.verifiedBox}>
                <h3 style={styles.verifiedTitle}>
                  ✓ Recommendation Verified
                </h3>
                <p style={styles.verifiedText}>
                  Category, department and priority have been verified by the
                  staff member.
                </p>
                <button
                  type="button"
                  onClick={createTicket}
                  style={styles.createButton}
                  disabled={savingTicket}
                >
                  {savingTicket ? "Creating Ticket..." : "🎫 Create Ticket"}
                </button>
              </div>
            )}
          </div>
        )}

        {ticket && (
          <div style={styles.ticketBox}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.ticketTitle}>Ticket Created Successfully</h2>
            <p style={styles.ticketSubtitle}>
              Your campus issue has been registered in CampusBridge.
            </p>
            <div style={styles.ticketId}>{ticket.ticketId}</div>
            <div style={styles.firebaseBadge}>✓ Saved to Firebase</div>

            <div style={styles.ticketDetails}>
              <div style={styles.ticketRow}>
                <strong>Title</strong>
                <span>{ticket.title}</span>
              </div>
              <div style={styles.ticketRow}>
                <strong>Description</strong>
                <span>{ticket.description}</span>
              </div>
              <div style={styles.ticketRow}>
                <strong>Location</strong>
                <span>{ticket.location}</span>
              </div>
              <div style={styles.ticketRow}>
                <strong>Category</strong>
                <span>{ticket.category}</span>
              </div>
              <div style={styles.ticketRow}>
                <strong>Department</strong>
                <span>{ticket.department}</span>
              </div>
              <div style={styles.ticketRow}>
                <strong>Priority</strong>
                <span>{ticket.priority}</span>
              </div>
              <div style={styles.ticketRow}>
                <strong>Status</strong>
                <span style={styles.statusBadge}>{ticket.status}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              style={styles.newComplaintButton}
            >
              + Raise Another Complaint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #3b0a18, #6b1d2a, #8b2635)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "35px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.97)",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "30px",
  },
  logo: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontWeight: "bold",
    fontSize: "19px",
    flexShrink: 0,
  },
  heading: { margin: 0, color: "#111827", fontSize: "27px" },
  subtitle: { margin: "6px 0 0", color: "#6b7280", fontSize: "14px" },
  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "18px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    background: "white",
    color: "#111827",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "150px",
    padding: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
    fontFamily: "Arial, sans-serif",
    background: "white",
    color: "#111827",
  },
  button: {
    width: "100%",
    marginTop: "28px",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    background: "#fee2e2",
    color: "#991b1b",
    lineHeight: "1.5",
  },
  result: {
    marginTop: "30px",
    padding: "22px",
    borderRadius: "16px",
    background: "#f5f3ff",
    border: "1px solid #ddd6fe",
    color: "#111827",
  },
  resultTitle: { marginTop: 0, color: "#4c1d95" },
  recommendationText: { color: "#6b7280", fontSize: "14px", lineHeight: "1.5" },
  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
  },
  verificationBox: {
    marginTop: "22px",
    padding: "20px",
    borderRadius: "14px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
  },
  verificationTitle: { marginTop: 0, color: "#9a3412" },
  verificationText: { color: "#7c2d12", fontSize: "14px", lineHeight: "1.5" },
  acceptButton: {
    width: "100%",
    padding: "13px",
    marginTop: "10px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  editButton: {
    width: "100%",
    padding: "13px",
    marginTop: "10px",
    border: "1px solid #6366f1",
    borderRadius: "10px",
    background: "white",
    color: "#4f46e5",
    fontWeight: "600",
    cursor: "pointer",
  },
  editBox: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #c4b5fd",
  },
  editTitle: { marginTop: 0, color: "#4c1d95" },
  saveButton: {
    width: "100%",
    padding: "13px",
    marginTop: "20px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  verifiedBox: {
    marginTop: "22px",
    padding: "20px",
    borderRadius: "14px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
  },
  verifiedTitle: { marginTop: 0, color: "#166534" },
  verifiedText: { color: "#166534", fontSize: "14px", lineHeight: "1.5" },
  createButton: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  ticketBox: { textAlign: "center", padding: "10px" },
  successIcon: {
    width: "70px",
    height: "70px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dcfce7",
    color: "#16a34a",
    fontSize: "36px",
    fontWeight: "bold",
  },
  ticketTitle: { margin: 0, color: "#166534", fontSize: "25px" },
  ticketSubtitle: { color: "#6b7280", fontSize: "14px", lineHeight: "1.5" },
  ticketId: {
    display: "inline-block",
    margin: "15px 0 10px",
    padding: "10px 18px",
    borderRadius: "10px",
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: "700",
    fontSize: "18px",
  },
  firebaseBadge: {
    width: "fit-content",
    margin: "0 auto 25px",
    padding: "7px 14px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "13px",
    fontWeight: "600",
  },
  ticketDetails: {
    textAlign: "left",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    overflow: "hidden",
  },
  ticketRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    fontSize: "14px",
  },
  statusBadge: {
    padding: "5px 12px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "700",
  },
  newComplaintButton: {
    width: "100%",
    padding: "14px",
    marginTop: "25px",
    border: "1px solid #6366f1",
    borderRadius: "10px",
    background: "white",
    color: "#4f46e5",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default RaiseComplaint;
