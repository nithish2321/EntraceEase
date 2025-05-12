import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AssignTestCenters({ token, collegeId }) {
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState('');
  const [emailSummary, setEmailSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/student-assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched assignments:', response.data); // Debug log
      setAssignments(response.data);
      setMessage(response.data.length === 0 ? 'No assignments available' : '');
      setEmailSummary(null);
    } catch (error) {
      console.error('Error fetching assignments:', error.response?.data || error.message);
      setMessage('Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/assign-test-centers',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Assignment response:', response.data); // Debug log
      setEmailSummary(response.data.emailSummary);
      setMessage(
        `Test centers assigned. Emails: ${response.data.emailSummary.sent} sent, ${response.data.emailSummary.failed} failed, ${response.data.emailSummary.pending} pending`
      );
      // Refresh the table by fetching the latest assignments
      await fetchAssignments();
    } catch (error) {
      console.error('Error assigning test centers:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'Error assigning test centers');
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (student) => {
    if (!student) {
      console.warn('Student data is missing');
      return 'Unknown Student';
    }
    const firstName = student.first_name || '';
    const lastName = student.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unnamed Student';
  };

  const filteredAssignments = assignments.filter((assignment) =>
    getFullName(assignment.studentId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '20px' }}>Assign Test Centers to Students</h3>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search student by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            width: '300px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
      </div>

      <button
        onClick={handleAssign}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s',
          marginBottom: '20px',
        }}
        disabled={loading}
      >
        {loading ? 'Assigning...' : 'Assign Test Centers'}
      </button>

      {message && (
        <p
          style={{
            margin: '10px 0',
            color: message.includes('Error') || message.includes('failed') ? 'red' : 'green',
          }}
        >
          {message}
        </p>
      )}

      {emailSummary && (
        <p style={{ margin: '10px 0', color: '#333' }}>
          Email Summary: {emailSummary.sent} sent, {emailSummary.failed} failed, {emailSummary.pending} pending
        </p>
      )}

      {filteredAssignments.length > 0 ? (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                S.No
              </th>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Student Name
              </th>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Registration No
              </th>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Test Center
              </th>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Location
              </th>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Exam Date
              </th>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Slot
              </th>
              <th style={{ padding: '12px', backgroundColor: '#f2f2f2', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Email Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map((assignment, index) => {
              if (!assignment.studentId || !assignment.testCenterId) {
                console.warn('Invalid assignment:', assignment);
              }
              return (
                <tr
                  key={index}
                  style={{
                    animation: 'fadeIn 0.5s ease-in',
                  }}
                >
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{index + 1}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <a
                      href={`/student-details/${assignment.studentId?._id || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'none' }}
                      onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
                      onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
                      onClick={() => {
                        if (!assignment.studentId?._id) {
                          console.warn('No studentId for assignment:', assignment);
                        }
                      }}
                    >
                      {getFullName(assignment.studentId)}
                    </a>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{assignment.regno || 'N/A'}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {assignment.testCenterId?.TestCenterName || 'Not Assigned'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {assignment.testCenterId?.Location || 'Not Assigned'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {assignment.examDate
                      ? new Date(assignment.examDate).toLocaleDateString()
                      : 'Not Set'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{assignment.slot || 'Not Set'}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {assignment.emailStatus || 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p style={{ marginTop: '20px' }}>No assignments match your search</p>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default AssignTestCenters;