import { useState } from 'react'
import './App.css'

function App() {
  // =========================
  // LOGIN
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')

  // =========================
  // PAGE
  // =========================

  const [page, setPage] = useState('dashboard')
  const [selectedTicket, setSelectedTicket] = useState(null)

  // =========================
  // TICKETS
  // =========================

  const [tickets, setTickets] = useState([
    {
      id: 'CB001',
      title: 'Projector not working',
      category: 'Projector',
      department: 'IT',
      priority: 'HIGH',
      status: 'NEW',
      dueDate: '2026-10-10',
      room: 'Room 204',
      description:
        'The projector in Room 204 is not working. Faculty members are unable to use the projector for classroom presentations.',
      assignedTo: '',
      adminResponse: '',
      aiRecommendation:
        'Category: Projector | Department: IT | Priority: HIGH',
      verifiedCategory: 'Projector',
      verifiedDepartment: 'IT',
      verifiedPriority: 'HIGH'
    },

    {
      id: 'CB002',
      title: 'Lab computer problem',
      category: 'Computer',
      department: 'IT',
      priority: 'MEDIUM',
      status: 'OVERDUE',
      dueDate: '2026-10-01',
      room: 'Computer Lab 1',
      description:
        'A computer in Computer Lab 1 is not working properly and students are unable to use it.',
      assignedTo: '',
      adminResponse: '',
      aiRecommendation:
        'Category: Computer | Department: IT | Priority: MEDIUM',
      verifiedCategory: 'Computer',
      verifiedDepartment: 'IT',
      verifiedPriority: 'MEDIUM'
    },

    {
      id: 'CB003',
      title: 'Classroom fan not working',
      category: 'Electrical',
      department: 'Maintenance',
      priority: 'LOW',
      status: 'IN_PROGRESS',
      dueDate: '2026-10-12',
      room: 'Room 105',
      description:
        'The ceiling fan in Room 105 is not working and needs to be checked by the maintenance team.',
      assignedTo: '',
      adminResponse: '',
      aiRecommendation:
        'Category: Electrical | Department: Maintenance | Priority: LOW',
      verifiedCategory: 'Electrical',
      verifiedDepartment: 'Maintenance',
      verifiedPriority: 'LOW'
    }
  ])

  // =========================
  // SEARCH AND FILTERS
  // =========================

  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  // =========================
  // TICKET DETAILS
  // =========================

  const [ticketStatus, setTicketStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [adminResponse, setAdminResponse] = useState('')

  // =========================
  // AI VERIFICATION
  // =========================

  const [verifiedCategory, setVerifiedCategory] = useState('')
  const [verifiedDepartment, setVerifiedDepartment] = useState('')
  const [verifiedPriority, setVerifiedPriority] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')

  // =========================
  // MESSAGES
  // =========================

  const [assignedMessage, setAssignedMessage] = useState('')
  const [responseMessage, setResponseMessage] = useState('')

  // =========================
  // LOGIN FUNCTION
  // =========================

  const handleLogin = (event) => {
    event.preventDefault()

    if (email.trim() === '' || password.trim() === '') {
      setLoginMessage('Please enter email and password.')
      return
    }

    setIsLoggedIn(true)
    setLoginMessage('')
    setPage('dashboard')
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setSelectedTicket(null)
    setPage('dashboard')
  }

  // =========================
  // OPEN TICKET DETAILS
  // =========================

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket)

    setTicketStatus(ticket.status)

    setAssignedTo(ticket.assignedTo || '')

    setAdminResponse(ticket.adminResponse || '')

    setVerifiedCategory(
      ticket.verifiedCategory || ticket.category
    )

    setVerifiedDepartment(
      ticket.verifiedDepartment || ticket.department
    )

    setVerifiedPriority(
      ticket.verifiedPriority || ticket.priority
    )

    setAssignedMessage('')
    setResponseMessage('')
    setVerificationMessage('')

    setPage('details')
  }

  // =========================
  // STATUS CHANGE
  // =========================

  const handleStatusChange = (event) => {
    const newStatus = event.target.value

    setTicketStatus(newStatus)

    if (!selectedTicket) {
      return
    }

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          status: newStatus
        }
      }

      return ticket
    })

    setTickets(updatedTickets)

    const updatedTicket = updatedTickets.find(
      (ticket) => ticket.id === selectedTicket.id
    )

    setSelectedTicket(updatedTicket)
  }

  // =========================
  // ASSIGN TICKET
  // =========================

  const handleAssignment = () => {
    if (assignedTo === '') {
      setAssignedMessage('Please select a staff member.')
      return
    }

    if (!selectedTicket) {
      return
    }

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          assignedTo: assignedTo,
          status: 'ASSIGNED'
        }
      }

      return ticket
    })

    setTickets(updatedTickets)

    const updatedTicket = updatedTickets.find(
      (ticket) => ticket.id === selectedTicket.id
    )

    setSelectedTicket(updatedTicket)

    setTicketStatus('ASSIGNED')

    setAssignedMessage(
      `Ticket assigned to ${assignedTo} and status changed to ASSIGNED`
    )
  }

  // =========================
  // ADMIN RESPONSE
  // =========================

  const handleAdminResponse = () => {
    if (adminResponse.trim() === '') {
      setResponseMessage('Please enter an admin response.')
      return
    }

    if (!selectedTicket) {
      return
    }

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          adminResponse: adminResponse
        }
      }

      return ticket
    })

    setTickets(updatedTickets)

    const updatedTicket = updatedTickets.find(
      (ticket) => ticket.id === selectedTicket.id
    )

    setSelectedTicket(updatedTicket)

    setResponseMessage('Admin response saved successfully.')
  }

  // =========================
  // SAVE AI VERIFICATION
  // =========================

  const handleVerification = () => {
    if (
      verifiedCategory === '' ||
      verifiedDepartment === '' ||
      verifiedPriority === ''
    ) {
      setVerificationMessage(
        'Please verify category, department and priority.'
      )

      return
    }

    if (!selectedTicket) {
      return
    }

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          verifiedCategory: verifiedCategory,
          verifiedDepartment: verifiedDepartment,
          verifiedPriority: verifiedPriority
        }
      }

      return ticket
    })

    setTickets(updatedTickets)

    const updatedTicket = updatedTickets.find(
      (ticket) => ticket.id === selectedTicket.id
    )

    setSelectedTicket(updatedTicket)

    setVerificationMessage(
      'AI recommendation verified successfully.'
    )
  }

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearchText('')
    setStatusFilter('')
    setPriorityFilter('')
    setCategoryFilter('')
    setDepartmentFilter('')
  }

  // =========================
  // FILTER TICKETS
  // =========================

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchText.toLowerCase()

    const matchesSearch =
      ticket.id.toLowerCase().includes(search) ||
      ticket.title.toLowerCase().includes(search) ||
      ticket.category.toLowerCase().includes(search) ||
      ticket.department.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter === '' || ticket.status === statusFilter

    const matchesPriority =
      priorityFilter === '' || ticket.priority === priorityFilter

    const matchesCategory =
      categoryFilter === '' || ticket.category === categoryFilter

    const matchesDepartment =
      departmentFilter === '' ||
      ticket.department === departmentFilter

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesDepartment
    )
  })

  // =========================
  // OVERDUE TICKETS
  // =========================

  const overdueTickets = tickets.filter(
    (ticket) => ticket.status === 'OVERDUE'
  )

  // =========================
  // ANALYTICS COUNTS
  // =========================

  const totalTickets = tickets.length

  const newTickets = tickets.filter(
    (ticket) => ticket.status === 'NEW'
  ).length

  const assignedTickets = tickets.filter(
    (ticket) => ticket.status === 'ASSIGNED'
  ).length

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === 'IN_PROGRESS'
  ).length

  const completedTickets = tickets.filter(
    (ticket) => ticket.status === 'COMPLETED'
  ).length

  const overdueCount = tickets.filter(
    (ticket) => ticket.status === 'OVERDUE'
  ).length

  const reopenedTickets = tickets.filter(
    (ticket) => ticket.status === 'REOPENED'
  ).length

  // =========================
  // LOGIN PAGE
  // =========================

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
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>

          </form>

          {loginMessage && (
            <p className="error-message">
              {loginMessage}
            </p>
          )}

        </div>
      </div>
    )
  }

  // =========================
  // MAIN ADMIN PANEL
  // =========================

  return (
    <div className="app-container">

      {/* =========================
          SIDEBAR
      ========================= */}

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

          <button
            className={
              page === 'dashboard'
                ? 'active-nav'
                : ''
            }
            onClick={() => {
              setPage('dashboard')
              setSelectedTicket(null)
            }}
          >
            Dashboard
          </button>

          <button
            className={
              page === 'tickets'
                ? 'active-nav'
                : ''
            }
            onClick={() => {
              setPage('tickets')
              setSelectedTicket(null)
            }}
          >
            All Tickets
          </button>

          <button
            className={
              page === 'overdue'
                ? 'active-nav'
                : ''
            }
            onClick={() => {
              setPage('overdue')
              setSelectedTicket(null)
            }}
          >
            Overdue Tickets
          </button>

          <button
            className={
              page === 'analytics'
                ? 'active-nav'
                : ''
            }
            onClick={() => {
              setPage('analytics')
              setSelectedTicket(null)
            }}
          >
            Analytics
          </button>

        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">

        {/* =========================
            DASHBOARD
        ========================= */}

        {page === 'dashboard' && (
          <div>

            <div className="page-header">

              <h1>Admin Dashboard</h1>

              <p>
                Campus issue management overview
              </p>

            </div>

            <div className="stats-grid">

              <div className="stat-card">
                <h3>Total Tickets</h3>
                <p>{totalTickets}</p>
              </div>

              <div className="stat-card">
                <h3>New</h3>
                <p>{newTickets}</p>
              </div>

              <div className="stat-card">
                <h3>Assigned</h3>
                <p>{assignedTickets}</p>
              </div>

              <div className="stat-card">
                <h3>In Progress</h3>
                <p>{inProgressTickets}</p>
              </div>

              <div className="stat-card">
                <h3>Completed</h3>
                <p>{completedTickets}</p>
              </div>

              <div className="stat-card">
                <h3>Overdue</h3>
                <p>{overdueCount}</p>
              </div>

              <div className="stat-card">
                <h3>Reopened</h3>
                <p>{reopenedTickets}</p>
              </div>

            </div>

            <div className="dashboard-section">

              <h2>Recent Tickets</h2>

              <table>

                <thead>

                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>

                      <td>

                        <button
                          className="ticket-link"
                          onClick={() =>
                            openTicketDetails(ticket)
                          }
                        >
                          {ticket.id}
                        </button>

                      </td>

                      <td>{ticket.title}</td>

                      <td>{ticket.category}</td>

                      <td>{ticket.department}</td>

                      <td>

                        <span
                          className={`priority-badge ${ticket.priority.toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`status-badge ${ticket.status
                            .toLowerCase()
                            .replace('_', '-')}`}
                        >
                          {ticket.status}
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* =========================
            ALL TICKETS
        ========================= */}

        {page === 'tickets' && (
          <div>

            <div className="page-header">

              <h1>All Tickets</h1>

              <p>
                View and manage all campus issues
              </p>

            </div>

            <div className="search-box">

              <input
                type="text"
                placeholder="Search by ID, title, category or department"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
              />

            </div>

            <div className="filters">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >

                <option value="">
                  All Statuses
                </option>

                <option value="NEW">
                  NEW
                </option>

                <option value="ASSIGNED">
                  ASSIGNED
                </option>

                <option value="IN_PROGRESS">
                  IN_PROGRESS
                </option>

                <option value="COMPLETED">
                  COMPLETED
                </option>

                <option value="OVERDUE">
                  OVERDUE
                </option>

                <option value="REOPENED">
                  REOPENED
                </option>

              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
              >

                <option value="">
                  All Priorities
                </option>

                <option value="HIGH">
                  HIGH
                </option>

                <option value="MEDIUM">
                  MEDIUM
                </option>

                <option value="LOW">
                  LOW
                </option>

              </select>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >

                <option value="">
                  All Categories
                </option>

                <option value="Projector">
                  Projector
                </option>

                <option value="Computer">
                  Computer
                </option>

                <option value="Electrical">
                  Electrical
                </option>

              </select>

              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
              >

                <option value="">
                  All Departments
                </option>

                <option value="IT">
                  IT
                </option>

                <option value="Maintenance">
                  Maintenance
                </option>

              </select>

              <button
                className="clear-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredTickets.length > 0 ? (

                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id}>

                        <td>

                          <button
                            className="ticket-link"
                            onClick={() =>
                              openTicketDetails(ticket)
                            }
                          >
                            {ticket.id}
                          </button>

                        </td>

                        <td>{ticket.title}</td>

                        <td>{ticket.category}</td>

                        <td>{ticket.department}</td>

                        <td>

                          <span
                            className={`priority-badge ${ticket.priority.toLowerCase()}`}
                          >
                            {ticket.priority}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${ticket.status
                              .toLowerCase()
                              .replace('_', '-')}`}
                          >
                            {ticket.status}
                          </span>

                        </td>

                        <td>{ticket.dueDate}</td>

                      </tr>
                    ))

                  ) : (

                    <tr>

                      <td colSpan="7">
                        No tickets found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* =========================
            OVERDUE TICKETS
        ========================= */}

        {page === 'overdue' && (
          <div>

            <div className="page-header">

              <h1>Overdue Tickets</h1>

              <p>
                Tickets that require immediate attention
              </p>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>

                </thead>

                <tbody>

                  {overdueTickets.length > 0 ? (

                    overdueTickets.map((ticket) => (
                      <tr key={ticket.id}>

                        <td>

                          <button
                            className="ticket-link"
                            onClick={() =>
                              openTicketDetails(ticket)
                            }
                          >
                            {ticket.id}
                          </button>

                        </td>

                        <td>{ticket.title}</td>

                        <td>{ticket.department}</td>

                        <td>

                          <span
                            className={`priority-badge ${ticket.priority.toLowerCase()}`}
                          >
                            {ticket.priority}
                          </span>

                        </td>

                        <td>

                          <span className="status-badge overdue">
                            OVERDUE
                          </span>

                        </td>

                        <td>{ticket.dueDate}</td>

                      </tr>
                    ))

                  ) : (

                    <tr>

                      <td colSpan="6">
                        No overdue tickets.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* =========================
            ANALYTICS
        ========================= */}

        {page === 'analytics' && (
          <div>

            <div className="page-header">

              <h1>Basic Analytics</h1>

              <p>
                Overview of ticket status and priority
              </p>

            </div>

            <div className="stats-grid">

              <div className="stat-card">
                <h3>Total</h3>
                <p>{totalTickets}</p>
              </div>

              <div className="stat-card">
                <h3>New</h3>
                <p>{newTickets}</p>
              </div>

              <div className="stat-card">
                <h3>Assigned</h3>
                <p>{assignedTickets}</p>
              </div>

              <div className="stat-card">
                <h3>In Progress</h3>
                <p>{inProgressTickets}</p>
              </div>

              <div className="stat-card">
                <h3>Completed</h3>
                <p>{completedTickets}</p>
              </div>

              <div className="stat-card">
                <h3>Overdue</h3>
                <p>{overdueCount}</p>
              </div>

              <div className="stat-card">
                <h3>Reopened</h3>
                <p>{reopenedTickets}</p>
              </div>

            </div>

            <div className="analytics-section">

              <h2>Priority Summary</h2>

              <p>
                HIGH:{' '}
                {
                  tickets.filter(
                    (ticket) =>
                      ticket.priority === 'HIGH'
                  ).length
                }
              </p>

              <p>
                MEDIUM:{' '}
                {
                  tickets.filter(
                    (ticket) =>
                      ticket.priority === 'MEDIUM'
                  ).length
                }
              </p>

              <p>
                LOW:{' '}
                {
                  tickets.filter(
                    (ticket) =>
                      ticket.priority === 'LOW'
                  ).length
                }
              </p>

            </div>

            <div className="analytics-section">

              <h2>Department Summary</h2>

              <p>
                IT:{' '}
                {
                  tickets.filter(
                    (ticket) =>
                      ticket.department === 'IT'
                  ).length
                }
              </p>

              <p>
                Maintenance:{' '}
                {
                  tickets.filter(
                    (ticket) =>
                      ticket.department === 'Maintenance'
                  ).length
                }
              </p>

            </div>

          </div>
        )}

        {/* =========================
            TICKET DETAILS
        ========================= */}

        {page === 'details' && selectedTicket && (
          <div>

            <div className="page-header">

              <h1>Ticket Details</h1>

              <p>
                Review and manage selected ticket
              </p>

            </div>

            <div className="ticket-details-card">

              <h2>{selectedTicket.title}</h2>

              <p className="ticket-id">
                Ticket ID:{' '}
                <strong>{selectedTicket.id}</strong>
              </p>

              {/* =========================
                  BASIC DETAILS
              ========================= */}

              <div className="details-grid">

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

                  <p>

                    <span
                      className={`priority-badge ${selectedTicket.priority.toLowerCase()}`}
                    >
                      {selectedTicket.priority}
                    </span>

                  </p>

                </div>

                <div>
                  <strong>Current Status</strong>

                  <p>

                    <span
                      className={`status-badge ${ticketStatus
                        .toLowerCase()
                        .replace('_', '-')}`}
                    >
                      {ticketStatus}
                    </span>

                  </p>

                </div>

                <div>
                  <strong>Room</strong>
                  <p>{selectedTicket.room}</p>
                </div>

                <div>
                  <strong>Due Date</strong>
                  <p>{selectedTicket.dueDate}</p>
                </div>

                <div>
                  <strong>Assigned To</strong>

                  <p>
                    {selectedTicket.assignedTo
                      ? selectedTicket.assignedTo
                      : 'Not assigned'}
                  </p>

                </div>

              </div>

              {/* =========================
                  DESCRIPTION
              ========================= */}

              <div className="detail-section">

                <h3>Description</h3>

                <p>
                  {selectedTicket.description}
                </p>

              </div>

              {/* =========================
                  AI RECOMMENDATION
              ========================= */}

              <div className="detail-section">

                <h3>AI Recommendation</h3>

                <p>
                  {selectedTicket.aiRecommendation}
                </p>

              </div>

              {/* =========================
                  AI VERIFICATION
              ========================= */}

              <div className="detail-section">

                <h3>Verify AI Recommendation</h3>

                <p>
                  Admin can verify or edit the AI
                  recommendation before continuing.
                </p>

                <div className="verification-grid">

                  <div>

                    <label>
                      Verified Category
                    </label>

                    <select
                      value={verifiedCategory}
                      onChange={(event) =>
                        setVerifiedCategory(
                          event.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Category
                      </option>

                      <option value="Projector">
                        Projector
                      </option>

                      <option value="Computer">
                        Computer
                      </option>

                      <option value="Electrical">
                        Electrical
                      </option>

                    </select>

                  </div>

                  <div>

                    <label>
                      Verified Department
                    </label>

                    <select
                      value={verifiedDepartment}
                      onChange={(event) =>
                        setVerifiedDepartment(
                          event.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Department
                      </option>

                      <option value="IT">
                        IT
                      </option>

                      <option value="Maintenance">
                        Maintenance
                      </option>

                    </select>

                  </div>

                  <div>

                    <label>
                      Verified Priority
                    </label>

                    <select
                      value={verifiedPriority}
                      onChange={(event) =>
                        setVerifiedPriority(
                          event.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Priority
                      </option>

                      <option value="HIGH">
                        HIGH
                      </option>

                      <option value="MEDIUM">
                        MEDIUM
                      </option>

                      <option value="LOW">
                        LOW
                      </option>

                    </select>

                  </div>

                </div>

                <button
                  className="action-button"
                  onClick={handleVerification}
                >
                  Save Verification
                </button>

                {verificationMessage && (
                  <p className="success-message">
                    {verificationMessage}
                  </p>
                )}

              </div>

              {/* =========================
                  ASSIGN TICKET
              ========================= */}

              <div className="detail-section">

                <h3>Assign Ticket</h3>

                <select
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(event.target.value)
                  }
                >

                  <option value="">
                    Select staff member
                  </option>

                  <option value="IT Support">
                    IT Support
                  </option>

                  <option value="Maintenance Team">
                    Maintenance Team
                  </option>

                  <option value="Electrical Team">
                    Electrical Team
                  </option>

                </select>

                <button
                  className="action-button"
                  onClick={handleAssignment}
                >
                  Assign Ticket
                </button>

                {assignedMessage && (
                  <p className="success-message">
                    {assignedMessage}
                  </p>
                )}

              </div>

              {/* =========================
                  STATUS MANAGEMENT
              ========================= */}

              <div className="detail-section">

                <h3>Status Management</h3>

                <select
                  value={ticketStatus}
                  onChange={handleStatusChange}
                >

                  <option value="NEW">
                    NEW
                  </option>

                  <option value="ASSIGNED">
                    ASSIGNED
                  </option>

                  <option value="IN_PROGRESS">
                    IN_PROGRESS
                  </option>

                  <option value="COMPLETED">
                    COMPLETED
                  </option>

                  <option value="OVERDUE">
                    OVERDUE
                  </option>

                  <option value="REOPENED">
                    REOPENED
                  </option>

                </select>

              </div>

              {/* =========================
                  ADMIN RESPONSE
              ========================= */}

              <div className="detail-section">

                <h3>Admin Response</h3>

                <textarea
                  rows="5"
                  placeholder="Enter response for this ticket..."
                  value={adminResponse}
                  onChange={(event) =>
                    setAdminResponse(
                      event.target.value
                    )
                  }
                />

                <button
                  className="action-button"
                  onClick={handleAdminResponse}
                >
                  Save Response
                </button>

                {responseMessage && (
                  <p className="success-message">
                    {responseMessage}
                  </p>
                )}

                {selectedTicket.adminResponse && (
                  <div className="saved-response">

                    <h4>Saved Response</h4>

                    <p>
                      {selectedTicket.adminResponse}
                    </p>

                  </div>
                )}

              </div>

              {/* =========================
                  BACK BUTTON
              ========================= */}

              <button
                className="back-button"
                onClick={() => {
                  setPage('tickets')
                  setSelectedTicket(null)
                }}
              >
                Back to All Tickets
              </button>

            </div>

          </div>
        )}

      </main>

    </div>
  )
}

export default App