import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Retrieve({ token, collegeId }) {
  const [students, setStudents] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [message, setMessage] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setStudents(data);
      if (data.length > 0) {
        const allHeaders = data.reduce((acc, student) => {
          Object.keys(student).forEach((key) => {
            if (key !== '_id' && key !== '__v' && key !== 'collegeId' && key !== 'first_name' && key !== 'last_name' && !acc.includes(key)) {
              acc.push(key);
            }
          });
          return acc;
        }, []);
        setHeaders(['Student Name', ...allHeaders]);
      } else {
        setHeaders([]);
        setMessage('No student data available');
      }
    } catch (error) {
      setMessage('Error fetching student data');
    }
  };

  const getFullName = (student) => {
    const firstName = student?.first_name || '';
    const lastName = student?.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Student';
  };

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <h3>Student Data</h3>
      {students.length > 0 && headers.length > 0 ? (
        <table
          style={{
            margin: '20px auto',
            borderCollapse: 'collapse',
            width: '80%',
            maxWidth: '800px',
            border: '1px solid #ddd',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: '10px',
                  backgroundColor: '#f2f2f2',
                  border: '1px solid #ddd',
                }}
              >
                S.No
              </th>
              {headers.map((header, index) => (
                <th
                  key={index}
                  style={{
                    padding: '10px',
                    backgroundColor: '#f2f2f2',
                    border: '1px solid #ddd',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                  }}
                >
                  {index + 1}
                </td>
                {headers.map((header, hIndex) => (
                  <td
                    key={hIndex}
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                    }}
                  >
                    {header === 'Student Name' ? getFullName(student) : student[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{message || 'No student data available'}</p>
      )}
    </div>
  );
}

export default Retrieve;