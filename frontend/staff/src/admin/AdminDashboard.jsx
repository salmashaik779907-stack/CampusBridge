
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import './AdminDashboard.css';

function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  const [page, setPage] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState('');
  const [saving, setSaving] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const [ticketStatus, setTicketStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  const [verifiedCategory, setVerifiedCategory] = useState('');
  const [verifiedDepartment, setVerifiedDepartment] = useState('');
  const [verifiedPriority, setVerifiedPriority] = useState('');

  const [assignedMessage, setAssignedMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  // LIVE FIREBASE TICKETS
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tickets'),
      (snapshot) => {
        const liveTickets = snapshot.docs.map((ticketDoc) => {
          const data = ticketDoc.data();
          const recommendation = data.aiRecommendation;

          return {
            ...data,
            firestoreId: ticketDoc.id,
            id: data.ticketId || ticketDoc.id,
            title: data.title || 'Untitled complaint',
            description: data.description || '',
            category: data.category || 'Uncategorized',
            department: data.department || 'Unassigned',
            priority: data.priority || 'MEDIUM',
            status: data.status || 'NEW',
            location: data.location || data.room || 'Not provided',
            room: data.room || data.location || 'Not provided',

            // Faculty form saves userEmail and userId.
            facultyName:
              data.facultyName ||
              data.userName ||
              data.userEmail ||
              'Unknown faculty',
            facultyEmail: data.userEmail || '',
            facultyId: data.userId || '',

            // Worker information from the faculty ticket.
            assignedTo:
              data.assignedTo ||
              data.assignedWorkerName ||
              '',
            assignedWorkerEmail: data.assignedWorkerEmail || '',
            assignedWorkerId: data.assignedWorkerId || '',

            dueDate: data.dueDate?.toDate
              ? data.dueDate.toDate().toLocaleDateString()
              : data.dueDate || 'Not set',

            adminResponse: data.adminResponse || '',

            aiRecommendation:
              typeof recommendation === 'object' && recommendation !== null
                ? `Category: ${recommendation.category || '-'} | Department: ${recommendation.department || '-'} | Priority: ${recommendation.priority || '-'}`
                : recommendation || 'No recommendation available',

            verifiedCategory:
              data.verifiedCategory || data.category || '',
            verifiedDepartment:
              data.verifiedDepartment || data.department || '',
            verifiedPriority:
              data.verifiedPriority || data.priority || '',
          };
        });

        setTickets(liveTickets);
        setTicketsLoading(false);
        setTicketsError('');

        // Keep the open details panel synchronized with Firebase.
        setSelectedTicket((current) => {
          if (!current) return null;
          return (
            liveTickets.find(
              (ticket) => ticket.firestoreId === current.firestoreId
            ) || current
          );
        });
      },
      (error) => {
        console.error('Failed to load tickets:', error);
        setTicketsError(
          'Could not load tickets. Check Firebase configuration and Firestore permissions.'
        );
        setTicketsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // SAVE CHANGES TO FIRESTORE
  const saveTicket = async (ticket, changes) => {
    if (!ticket?.firestoreId) {
      throw new Error('This ticket has no Firestore document ID.');
    }

    setSaving(true);
    setTicketsError('');

    try {
      await updateDoc(doc(db, 'tickets', ticket.firestoreId), {
        ...changes,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to update ticket:', error);
      setTicketsError(
        'Could not save changes. Check your internet connection and Firestore permissions.'
      );
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setLoginMessage('Please enter email and password.');
      return;
    }

    // This is the existing demo login behavior, not Firebase authentication.
    setIsLoggedIn(true);
    setLoginMessage('');
    setPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setSelectedTicket(null);
    setPage('dashboard');
  };

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status);
    setAssignedTo(ticket.assignedTo || '');
    setAdminResponse(ticket.adminResponse || '');
    setVerifiedCategory(ticket.verifiedCategory || ticket.category);
    setVerifiedDepartment(
      ticket.verifiedDepartment || ticket.department
    );
    setVerifiedPriority(ticket.verifiedPriority || ticket.priority);
    setAssignedMessage('');
    setResponseMessage('');
    setVerificationMessage('');
    setPage('details');
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setTicketStatus(newStatus);

    if (!selectedTicket) return;

    try {
      await saveTicket(selectedTicket, { status: newStatus });
    } catch {
      setTicketStatus(selectedTicket.status);
    }
  };

  const handleAssignment = async () => {
    if (!assignedTo.trim()) {
      setAssignedMessage('Please select or enter a staff member.');
      return;
    }

    if (!selectedTicket) return;

    try {
      await saveTicket(selectedTicket, {
        assignedTo: assignedTo.trim(),
        status: 'ASSIGNED',
      });

      setTicketStatus('ASSIGNED');
      setAssignedMessage(
        `Ticket assigned to ${assignedTo.trim()} successfully.`
      );
    } catch {
      setAssignedMessage('Assignment could not be saved.');
    }
  };

  const handleAdminResponse = async () => {
    if (!adminResponse.trim()) {
      setResponseMessage('Please enter an admin response.');
      return;
    }

    if (!selectedTicket) return;

    try {
      await saveTicket(selectedTicket, {
        adminResponse: adminResponse.trim(),
      });
      setResponseMessage('Admin response saved successfully.');
    } catch {
      setResponseMessage('Response could not be saved.');
    }
  };

  const handleVerification = async () => {
    if (
      !verifiedCategory ||
      !verifiedDepartment ||
      !verifiedPriority
    ) {
      setVerificationMessage(
        'Please verify category, department and priority.'
      );
      return;
    }

    if (!selectedTicket) return;

    try {
      await saveTicket(selectedTicket, {
        verifiedCategory,
        verifiedDepartment,
        verifiedPriority,
      });
      setVerificationMessage(
        'AI recommendation verification saved successfully.'
      );
    } catch {
      setVerificationMessage('Verification could not be saved.');
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setDepartmentFilter('');
  };

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchText.toLowerCase();

    const searchableText = [
      ticket.id,
      ticket.title,
      ticket.category,
      ticket.department,
      ticket.facultyName,
      ticket.facultyEmail,
      ticket.assignedTo,
    ]
      .join(' ')
      .toLowerCase();

    return (
      searchableText.includes(search) &&
      (!statusFilter || ticket.status === statusFilter) &&
      (!priorityFilter || ticket.priority === priorityFilter) &&
      (!categoryFilter || ticket.category === categoryFilter) &&
      (!departmentFilter || ticket.department === departmentFilter)
    );
  });

  const overdueTickets = tickets.filter(
    (ticket) => ticket.status === 'OVERDUE'
  );

  const countStatus = (status) =>
    tickets.filter((ticket) => ticket.status === status).length;

  const totalTickets = tickets.length;
  const newTickets = countStatus('NEW');
  const assignedTickets = countStatus('ASSIGNED');
  const inProgressTickets = countStatus('IN_PROGRESS');
  const completedTickets = countStatus('COMPLETED');
  const overdueCount = countStatus('OVERDUE');
  const reopenedTickets = countStatus('REOPENED');

  const statusBadge = (status) => (
    <span
      className={`status-badge ${(status || 'NEW')
        .toLowerCase()
        .replace('_', '-')}`}
    >
      {status || 'NEW'}
    </span>
  );

  const priorityBadge = (priority) => (
    <span
      className={`priority-badge ${(priority || 'MEDIUM').toLowerCase()}`}
    >
      {priority || 'MEDIUM'}
    </span>
  );

  const ticketTableRows = (items) =>
    items.map((ticket) => (
      <tr key={ticket.firestoreId}>
        <td>
          <button
            className="ticket-link"
            onClick={() => openTicketDetails(ticket)}
          >
            {ticket.id}
          </button>
        </td>
        <td>{ticket.title}</td>
        <td>{ticket.facultyName}</td>
        <td>{ticket.facultyEmail || 'Not provided'}</td>
        <td>{ticket.category}</td>
        <td>{ticket.department}</td>
        <td>{priorityBadge(ticket.priority)}</td>
        <td>{ticket.assignedTo || 'Not assigned'}</td>
        <td>{statusBadge(ticket.status)}</td>
        <td>{ticket.dueDate}</td>
      </tr>
    ));

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <img
            src="/ashoka-logo.jpeg"
            alt="Ashoka Women's Engineering College"
            className="college-logo"
          />
          <h1>CampusBridge</h1>
          <h2>Admin Login</h2>
          <p className="login-subtitle">
            AI-Powered Smart Campus Issue Management System
          </p>

          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          {loginMessage && (
            <p className="error-message">{loginMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-title">
          <div className="sidebar-brand">
            <img
              src="/ashoka-logo.jpeg"
              alt="Ashoka Women's Engineering College"
              className="sidebar-logo"
            />
            <div>
              <h2>CampusBridge</h2>
              <p>Admin Panel</p>
            </div>
          </div>
          <span className="college-name">
            Ashoka Women's Engineering College
          </span>
        </div>

        <nav>
          {[
            ['dashboard', 'Dashboard'],
            ['tickets', 'All Tickets'],
            ['overdue', 'Overdue Tickets'],
            ['analytics', 'Analytics'],
          ].map(([value, label]) => (
            <button
              key={value}
              className={page === value ? 'active-nav' : ''}
              onClick={() => {
                setPage(value);
                setSelectedTicket(null);
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        {ticketsLoading && <p>Loading tickets from Firebase...</p>}

        {ticketsError && (
          <p className="error-message" role="alert">
            {ticketsError}
          </p>
        )}

        {saving && <p>Saving changes...</p>}

        {page === 'dashboard' && (
          <div>
            <div className="page-header">
              <h1>Admin Dashboard</h1>
              <p>Campus issue management overview</p>
            </div>

            <div className="stats-grid">
              {[
                ['Total Tickets', totalTickets],
                ['New', newTickets],
                ['Assigned', assignedTickets],
                ['In Progress', inProgressTickets],
                ['Completed', completedTickets],
                ['Overdue', overdueCount],
                ['Reopened', reopenedTickets],
              ].map(([label, count]) => (
                <div className="stat-card" key={label}>
                  <h3>{label}</h3>
                  <p>{count}</p>
                </div>
              ))}
            </div>

            <div className="dashboard-section">
              <h2>Recent Tickets</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title</th>
                      <th>Faculty Name</th>
                      <th>Faculty Email</th>
                      <th>Category</th>
                      <th>Department</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketTableRows(tickets)}
                    {!ticketsLoading && tickets.length === 0 && (
                      <tr>
                        <td colSpan="10">
                          No tickets found in Firebase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {page === 'tickets' && (
          <div>
            <div className="page-header">
              <h1>All Tickets</h1>
              <p>View and manage all campus issues</p>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search ID, title, faculty, worker, category..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <div className="filters">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All Statuses</option>
                {[
                  'NEW',
                  'ASSIGNED',
                  'IN_PROGRESS',
                  'COMPLETED',
                  'OVERDUE',
                  'REOPENED',
                ].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="">All Priorities</option>
                {['HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="">All Categories</option>
                {['Projector', 'Computer', 'Electrical'].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <option value="">All Departments</option>
                {['IT', 'Maintenance'].map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>

              <button className="clear-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Faculty Name</th>
                    <th>Faculty Email</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketTableRows(filteredTickets)}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="10">No tickets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'overdue' && (
          <div>
            <div className="page-header">
              <h1>Overdue Tickets</h1>
              <p>Tickets that require immediate attention</p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Faculty Name</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueTickets.map((ticket) => (
                    <tr key={ticket.firestoreId}>
                      <td>
                        <button
                          className="ticket-link"
                          onClick={() => openTicketDetails(ticket)}
                        >
                          {ticket.id}
                        </button>
                      </td>
                      <td>{ticket.title}</td>
                      <td>{ticket.facultyName}</td>
                      <td>{ticket.department}</td>
                      <td>{priorityBadge(ticket.priority)}</td>
                      <td>{ticket.assignedTo || 'Not assigned'}</td>
                      <td>{statusBadge(ticket.status)}</td>
                      <td>{ticket.dueDate}</td>
                    </tr>
                  ))}
                  {overdueTickets.length === 0 && (
                    <tr>
                      <td colSpan="8">No overdue tickets.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'analytics' && (
          <div>
            <div className="page-header">
              <h1>Basic Analytics</h1>
              <p>Overview of ticket status and priority</p>
            </div>

            <div className="stats-grid">
              {[
                ['Total', totalTickets],
                ['New', newTickets],
                ['Assigned', assignedTickets],
                ['In Progress', inProgressTickets],
                ['Completed', completedTickets],
                ['Overdue', overdueCount],
                ['Reopened', reopenedTickets],
              ].map(([label, count]) => (
                <div className="stat-card" key={label}>
                  <h3>{label}</h3>
                  <p>{count}</p>
                </div>
              ))}
            </div>

            <div className="analytics-section">
              <h2>Priority Summary</h2>
              {['HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                <p key={priority}>
                  {priority}: {tickets.filter((ticket) => ticket.priority === priority).length}
                </p>
              ))}
            </div>

            <div className="analytics-section">
              <h2>Department Summary</h2>
              {['IT', 'Maintenance'].map((department) => (
                <p key={department}>
                  {department}: {tickets.filter((ticket) => ticket.department === department).length}
                </p>
              ))}
            </div>
          </div>
        )}

        {page === 'details' && selectedTicket && (
          <div>
            <div className="page-header">
              <h1>Ticket Details</h1>
              <p>Review and manage selected ticket</p>
            </div>

            <div className="ticket-details-card">
              <h2>{selectedTicket.title}</h2>
              <p className="ticket-id">
                Ticket ID: <strong>{selectedTicket.id}</strong>
              </p>

              <div className="details-grid">
                <div>
                  <strong>Faculty Name</strong>
                  <p>{selectedTicket.facultyName}</p>
                </div>
                <div>
                  <strong>Faculty Email</strong>
                  <p>{selectedTicket.facultyEmail || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Faculty User ID</strong>
                  <p>{selectedTicket.facultyId || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Category</strong>
                  <p>{selectedTicket.category}</p>
                </div>
                <div>
                  <strong>Department</strong>
                  <p>{selectedTicket.department}</p>
                </div>
                <div>
                  <strong>Priority</strong>
                  <p>{priorityBadge(selectedTicket.priority)}</p>
                </div>
                <div>
                  <strong>Current Status</strong>
                  <p>{statusBadge(ticketStatus)}</p>
                </div>
                <div>
                  <strong>Location / Room</strong>
                  <p>{selectedTicket.room}</p>
                </div>
                <div>
                  <strong>Due Date</strong>
                  <p>{selectedTicket.dueDate}</p>
                </div>
                <div>
                  <strong>Assigned Person</strong>
                  <p>{selectedTicket.assignedTo || 'Not assigned'}</p>
                </div>
                <div>
                  <strong>Assigned Person Email</strong>
                  <p>{selectedTicket.assignedWorkerEmail || 'Not provided'}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedTicket.description || 'No description provided.'}</p>
              </div>

              <div className="detail-section">
                <h3>AI Recommendation</h3>
                <p>{selectedTicket.aiRecommendation}</p>
              </div>

              <div className="detail-section">
                <h3>Verify AI Recommendation</h3>
                <p>Review and save the verified category, department and priority.</p>

                <div className="verification-grid">
                  <div>
                    <label>Verified Category</label>
                    <select value={verifiedCategory} onChange={(event) => setVerifiedCategory(event.target.value)}>
                      <option value="">Select Category</option>
                      {['Projector', 'Computer', 'Electrical'].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Verified Department</label>
                    <select value={verifiedDepartment} onChange={(event) => setVerifiedDepartment(event.target.value)}>
                      <option value="">Select Department</option>
                      {['IT', 'Maintenance'].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Verified Priority</label>
                    <select value={verifiedPriority} onChange={(event) => setVerifiedPriority(event.target.value)}>
                      <option value="">Select Priority</option>
                      {['HIGH', 'MEDIUM', 'LOW'].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="action-button" onClick={handleVerification} disabled={saving}>
                  Save Verification
                </button>
                {verificationMessage && <p className="success-message">{verificationMessage}</p>}
              </div>

              <div className="detail-section">
                <h3>Assign Ticket</h3>
                <label>Assigned staff member / team</label>
                <input
                  type="text"
                  placeholder="Enter staff person's name"
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                />
                <button className="action-button" onClick={handleAssignment} disabled={saving}>
                  Assign Ticket
                </button>
                {assignedMessage && <p className="success-message">{assignedMessage}</p>}
              </div>

              <div className="detail-section">
                <h3>Status Management</h3>
                <select value={ticketStatus} onChange={handleStatusChange} disabled={saving}>
                  {['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'REOPENED'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <p>Changes are saved to Firebase when you change the status.</p>
              </div>

              <div className="detail-section">
                <h3>Admin Response</h3>
                <textarea
                  rows="5"
                  placeholder="Enter response for this ticket..."
                  value={adminResponse}
                  onChange={(event) => setAdminResponse(event.target.value)}
                />
                <button className="action-button" onClick={handleAdminResponse} disabled={saving}>
                  Save Response
                </button>
                {responseMessage && <p className="success-message">{responseMessage}</p>}

                {selectedTicket.adminResponse && (
                  <div className="saved-response">
                    <h4>Saved Response</h4>
                    <p>{selectedTicket.adminResponse}</p>
                  </div>
                )}
              </div>

              <button
                className="back-button"
                onClick={() => {
                  setPage('tickets');
                  setSelectedTicket(null);
                }}
              >
                Back to All Tickets
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
