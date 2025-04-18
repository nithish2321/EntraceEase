import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import signature from '../assets/signature.png'; // Controller of Examinations signature

function StudentDetails() {
  const { id } = useParams();
  const [dob, setDob] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentName, setStudentName] = useState('Student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const host = "https://6cdftcxg-5000.inc1.devtunnels.ms"

  // Fetch student name on load
  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const response = await axios.get(`${host}/api/student/name/${id}`);
        setStudentName(response.data.name || 'Student');
      } catch (err) {
        console.warn('Error fetching student name:', err.response?.data || err.message);
        setStudentName('Student');
      }
    };
    fetchStudentName();
  }, [id]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${host}/api/student/verify/${id}`, { dob });
      setStudentDetails(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify details');
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (student) => {
    const firstName = student?.first_name || '';
    const lastName = student?.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unnamed Student';
  };

  // QR code data
  const getQRCodeData = (details) => {
    if (!details) return '';
    return JSON.stringify({
      name: getFullName(details),
      registrationNo: details.regno || 'N/A',
      exam: details.examName || 'N/A',
      date: details.examDate
        ? new Date(details.examDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
      slot: details.slot || 'N/A',
      testCenter: details.testCenter?.TestCenterName || 'N/A',
      issuedBy: 'Exam Management System',
      status: 'Allowed to take the exam',
    });
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      setError('');
      window.location.href = `${host}/api/student/hall-ticket/${id}/pdf`;
    } catch (err) {
      setError('Failed to initiate download');
    } finally {
      setTimeout(() => setDownloadLoading(false), 1000); // Brief delay for user feedback
    }
  };

  const handlePrint = async () => {
    try {
      setDownloadLoading(true);
      setError('');
      const response = await axios.get(`${host}/api/student/hall-ticket/${id}/pdf`, {
        responseType: 'blob',
      });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // Cleanup URL after printing
          printWindow.onafterprint = () => {
            URL.revokeObjectURL(pdfUrl);
            printWindow.close();
          };
        };
      } else {
        setError('Failed to open print window');
      }
    } catch (err) {
      setError('Failed to fetch PDF for printing');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          background: 'white',
          border: '3px solid #1a237e',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          padding: '40px',
        }}
      >
        {!studentDetails ? (
          <div>
            <h2
              style={{
                fontSize: '28px',
                marginBottom: '20px',
                color: '#1a237e',
                textAlign: 'center',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              TPVCE Test Booking Application
            </h2>
            <h3
              style={{
                fontSize: '24px',
                marginBottom: '20px',
                color: '#333',
                textAlign: 'center',
              }}
            >
              Welcome, {studentName}!
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#555',
                textAlign: 'center',
                marginBottom: '30px',
              }}
            >
              Please enter your date of birth to access your hall ticket.
            </p>
            <form onSubmit={handleVerify}>
              <div
                style={{
                  position: 'relative',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{
                    padding: '12px 12px 12px 40px',
                    width: '220px',
                    border: '2px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a237e';
                    e.target.style.boxShadow = '0 0 5px rgba(26, 35, 126, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ccc';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                    fontSize: '20px',
                  }}
                >
                  📅
                </span>
              </div>
              <button
                type="submit"
                style={{
                  padding: '12px 30px',
                  backgroundColor: loading ? '#757575' : '#1a237e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  width: '100%',
                  transition: 'background-color 0.3s',
                }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'View Hall Ticket'}
              </button>
              {error && (
                <p
                  style={{
                    color: '#c62828',
                    marginTop: '15px',
                    textAlign: 'center',
                    background: '#ffcdd2',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              padding: '0',
              background: 'white',
            }}
            className="hall-ticket"
          >
            {/* Header */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '1px solid #1a237e',
              }}
            >
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1a237e',
                  margin: '0',
                  textTransform: 'uppercase',
                }}
              >
                Hall Ticket
              </h1>
              <p
                style={{
                  fontSize: '20px',
                  color: '#333',
                  margin: '10px 0 5px',
                  fontWeight: 'bold',
                }}
              >
                TPVCE Test Booking Application
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: '#555',
                }}
              >
                Issued by: Third Party Vendor Common Entrance Test Booking Application
              </p>
            </div>

            {/* Candidate Details */}
            <div
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    marginBottom: '10px',
                    color: '#1a237e',
                    fontWeight: 'bold',
                  }}
                >
                  Candidate Details
                </h3>
                <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                  <strong>Name:</strong> {getFullName(studentDetails)}
                </p>
                <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                  <strong>Registration No:</strong> {studentDetails.regno || 'N/A'}
                </p>
                <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                  <strong>Email:</strong> {studentDetails.email || 'N/A'}
                </p>
              </div>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: '#e0e0e0',
                  border: '1px solid #1a237e',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#555',
                  textAlign: 'center',
                }}
              >
                [Candidate Photo]
              </div>
            </div>

            {/* Examination Details */}
            <div
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fafafa',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  marginBottom: '10px',
                  color: '#1a237e',
                  fontWeight: 'bold',
                }}
              >
                Examination Details
              </h3>
              <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                <strong>Examination:</strong> {studentDetails.examName || 'N/A'}
              </p>
              <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                <strong>Date:</strong>{' '}
                {studentDetails.examDate
                  ? new Date(studentDetails.examDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
              <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                <strong>Slot:</strong> {studentDetails.slot || 'N/A'}
              </p>
            </div>

            {/* Examination Center */}
            <div
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fafafa',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  marginBottom: '10px',
                  color: '#1a237e',
                  fontWeight: 'bold',
                }}
              >
                Examination Center
              </h3>
              <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                <strong>Center Name:</strong> {studentDetails.testCenter?.TestCenterName || 'N/A'}
              </p>
              <p style={{ fontSize: '16px', margin: '5px 0', color: '#333' }}>
                <strong>Location:</strong> {studentDetails.testCenter?.Location || 'N/A'}
              </p>
            </div>

            {/* Instructions */}
            <div
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fafafa',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  marginBottom: '10px',
                  color: '#1a237e',
                  fontWeight: 'bold',
                }}
              >
                Instructions to Candidates
              </h3>
              <ul
                style={{
                  fontSize: '16px',
                  listStyleType: 'decimal',
                  marginLeft: '20px',
                  color: '#333',
                  marginTop: '5px',
                }}
              >
                <li style={{ margin: '4px 0' }}>
                  Arrive at the examination center at least 30 minutes prior to the start time.
                </li>
                <li style={{ margin: '4px 0' }}>
                  Carry a valid photo ID (e.g., Aadhaar Card, Passport, College ID) along with this hall ticket.
                </li>
                <li style={{ margin: '4px 0' }}>
                  Electronic devices, including mobile phones, smartwatches, and calculators, are strictly prohibited.
                </li>
                <li style={{ margin: '4px 0' }}>
                  Adhere strictly to the instructions provided by the invigilator.
                </li>
                <li style={{ margin: '4px 0' }}>
                  This hall ticket must be presented for verification at the examination center.
                </li>
                <li style={{ margin: '4px 0' }}>
                  Candidates are not permitted to leave the examination hall until the exam concludes.
                </li>
              </ul>
            </div>

            {/* Verification */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fafafa',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  marginBottom: '10px',
                  color: '#1a237e',
                  fontWeight: 'bold',
                }}
              >
                Verification
              </h3>
              <QRCodeCanvas
                value={getQRCodeData(studentDetails)}
                size={120}
                style={{ marginBottom: '10px' }}
              />
              <p style={{ fontSize: '16px', color: '#333', margin: '5px 0' }}>
                <strong>Ticket ID:</strong> {studentDetails.regno || 'N/A'}
              </p>
              <p style={{ fontSize: '14px', color: '#555' }}>
                Scan to verify: Issued by Third Party Vendor Common Entrance Test Booking Application, Candidate is allowed to take the exam.
              </p>
            </div>

            {/* Signature Section */}
            <div
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#333',
                    margin: '0 0 5px 0',
                    fontWeight: 'bold',
                  }}
                >
                  Controller of Examinations
                </p>
                <img
                  src={signature}
                  alt="Controller of Examinations Signature"
                  style={{ width: '150px', height: 'auto' }}
                />
              </div>
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#333',
                    margin: '0 0 5px 0',
                    fontWeight: 'bold',
                  }}
                >
                  Candidate’s Signature
                </p>
                <div
                  style={{
                    width: '120px',
                    height: '30px',
                    borderBottom: '1px solid #333',
                  }}
                />
                <p
                  style={{
                    fontSize: '12px',
                    color: '#555',
                    marginTop: '3px',
                  }}
                >
                  To be signed in the presence of invigilator
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#555',
                marginTop: '20px',
                paddingTop: '10px',
                borderTop: '1px solid #1a237e',
              }}
            >
              <p style={{ margin: '5px 0 0' }}>
                This is a computer-generated hall ticket issued by the Exam Management System.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                textAlign: 'right',
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                onClick={handleDownload}
                style={{
                  padding: '10px 25px',
                  backgroundColor: downloadLoading ? '#757575' : '#1a237e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: downloadLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                }}
                disabled={downloadLoading}
                onMouseOver={(e) => {
                  if (!downloadLoading) e.target.style.backgroundColor = '#0d1b5e';
                }}
                onMouseOut={(e) => {
                  if (!downloadLoading) e.target.style.backgroundColor = '#1a237e';
                }}
              >
                {downloadLoading ? 'Processing...' : 'Download Hall Ticket'}
              </button>
              <button
                onClick={handlePrint}
                style={{
                  padding: '10px 25px',
                  backgroundColor: downloadLoading ? '#757575' : '#1a237e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: downloadLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                }}
                disabled={downloadLoading}
                onMouseOver={(e) => {
                  if (!downloadLoading) e.target.style.backgroundColor = '#0d1b5e';
                }}
                onMouseOut={(e) => {
                  if (!downloadLoading) e.target.style.backgroundColor = '#1a237e';
                }}
              >
                {downloadLoading ? 'Processing...' : 'Print Hall Ticket'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scoped CSS */}
      <style jsx>{`
        @media print {
          button {
            display: none;
          }
          .hall-ticket {
            border: none;
            box-shadow: none;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentDetails;