import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, updateBooking } from '../api';
import BookingForm from './BookingForm';
import Upload from './Upload';
import Retrieve from './Retrieve';
import AssignTestCenters from './AssignTestCenters';
import toast, { Toaster } from 'react-hot-toast';


const formGroupStyle = { marginBottom: "1.5rem" };

const inputStyle = {
  width: "90%",
  marginLeft: "30px",
  marginRight: "10px",
  padding: "0.65rem 0",
  border: "none",
  borderBottom: "1px solid #ccc",
  fontSize: "0.95rem",
  backgroundColor: "transparent",
  color: "rgb(1, 18, 2)",
  outline: "none",
  transition: "all 0.3s ease-in-out",
  caretColor: "#00ddeb",
};

const inputHoverStyle = {
  borderBottom: "1px solid #e0ffff",
};

const inputFocusStyle = {
  borderBottom: "1px solid #00ddeb",
  fontWeight: "bold",
};

const labelStyle = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "rgb(124, 176, 255)",
  marginBottom: "0.5rem",
  display: "block",
};

const buttonStyle = {
  width: "100%",
  padding: "0.85rem",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "bold",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
};

const buttonHoverStyle = {
  backgroundColor: "rgba(8, 12, 21, 0.27)",
};

const getInputStyle = (inputName, hoveredInput, focusedInput) => ({
  ...inputStyle,
  ...(hoveredInput === inputName ? inputHoverStyle : {}),
  ...(focusedInput === inputName ? inputFocusStyle : {}),
});

const getButtonStyle = (isHovered) => ({
  ...buttonStyle,
  ...(isHovered ? buttonHoverStyle : {}),
});

function CollegeDashboard({ token: propToken, collegeId: propCollegeId, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(propToken || localStorage.getItem('token'));
  const [collegeId, setCollegeId] = useState(propCollegeId || localStorage.getItem('collegeId'));
  const [hoveredInput, setHoveredInput] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Utility to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !collegeId) {
        navigate('/');
        return;
      }

      try {
        const { data: profileData } = await getProfile('college', token);
        setProfile(profileData || { BookedDates: [] });
        setError(null);
        localStorage.setItem('token', token);
        localStorage.setItem('collegeId', collegeId);
      } catch (err) {
        console.error('Failed to validate token:', err);
        setProfile({ BookedDates: [] });
        setError(err.response?.data?.error || 'Failed to load college data. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('collegeId');
        navigate('/');
      }
    };
    validateToken();
  }, [token, collegeId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: ['ExamFees', 'AgeLimit', 'PreviousYearCutOff', 'ExamDuration'].includes(name)
        ? parseInt(value) || 0
        : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile('college', token, profile);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('collegeId');
    onLogout();
    navigate('/');
  };

  const handleBookingUpdate = (newBooking) => {
    const updatedProfile = { ...profile };
    newBooking.TestCenters.forEach((testCenter) => {
      testCenter.BookingDates.forEach((bookingDate) => {
        const formattedBookingDate = formatDate(bookingDate.Date);
        const existingDate = updatedProfile.BookedDates.find(
          (d) => formatDate(d.Date) === formattedBookingDate
        );
        if (existingDate) {
          bookingDate.Slots.forEach((slot) => {
            existingDate.Slots.push({
              Slot: slot.Slot,
              SeatsBooked: slot.SeatsToBook,
              TestCenterId: testCenter.TestCenterId,
              BookingId: newBooking._id,
            });
          });
        } else {
          updatedProfile.BookedDates.push({
            Date: formattedBookingDate,
            Slots: bookingDate.Slots.map((slot) => ({
              Slot: slot.Slot,
              SeatsBooked: slot.SeatsToBook,
              TestCenterId: testCenter.TestCenterId,
              BookingId: newBooking._id,
            })),
          });
        }
      });
    });
    setProfile(updatedProfile);
  };

  const handleEditBooking = (dateIndex, slotIndex) => {
    const slot = profile.BookedDates[dateIndex].Slots[slotIndex];
    setEditingBooking({
      _id: slot.BookingId,
      TestCenters: [
        {
          TestCenterId: slot.TestCenterId,
          BookingDates: [
            {
              Date: formatDate(profile.BookedDates[dateIndex].Date),
              Slots: [{ Slot: slot.Slot, SeatsToBook: slot.SeatsBooked }],
            },
          ],
        },
      ],
    });
  };

  const handleBookingChange = (e) => {
    const { value } = e.target;
    setEditingBooking((prev) => ({
      ...prev,
      TestCenters: prev.TestCenters.map((tc) => ({
        ...tc,
        BookingDates: tc.BookingDates.map((bd) => ({
          ...bd,
          Slots: bd.Slots.map((slot) => ({
            ...slot,
            SeatsToBook: parseInt(value) || 0,
          })),
        })),
      })),
    }));
  };

  const handleSaveBooking = async () => {
    try {
      await updateBooking(token, editingBooking._id, editingBooking);
      const formattedEditingDate = formatDate(editingBooking.TestCenters[0].BookingDates[0].Date);
      const updatedProfile = { ...profile };
      const dateIndex = updatedProfile.BookedDates.findIndex(
        (d) => formatDate(d.Date) === formattedEditingDate
      );
      const slotIndex = updatedProfile.BookedDates[dateIndex].Slots.findIndex(
        (s) =>
          s.Slot === editingBooking.TestCenters[0].BookingDates[0].Slots[0].Slot &&
          s.TestCenterId.toString() === editingBooking.TestCenters[0].TestCenterId.toString()
      );
      updatedProfile.BookedDates[dateIndex].Slots[slotIndex].SeatsBooked =
        editingBooking.TestCenters[0].BookingDates[0].Slots[0].SeatsToBook;
      setProfile(updatedProfile);
      setEditingBooking(null);
      toast.success('Booking updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update booking.');
    }
  };

  if (!profile) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f7fb',
        fontFamily: "'Inter', sans-serif",
      }}>
        <span style={{
          fontSize: '1.25rem',
          color: '#4b5e7e',
          fontWeight: '600',
          animation: 'pulse 1.5s infinite',
        }}>Loading...</span>
      </div>
    );
  }

  const collegeDetails = Object.keys(profile)
    .filter((key) => !['_id', '__v', 'BookedDates'].includes(key))
    .map((key) => ({
      key,
      value: profile[key] || (typeof profile[key] === 'number' ? 0 : 'N/A'),
      isNumber: ['ExamFees', 'AgeLimit', 'PreviousYearCutOff', 'ExamDuration'].includes(key),
    }));

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f7fb',
      fontFamily: "'Inter', sans-serif",
      color: '#1f2a44',
    }}>
      <Toaster position="top-center" />
      <header style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2a44',
          }}>College Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#ff4d4f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e6393d'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4f'}
          >
            Logout
          </button>
        </div>
      </header>

      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem 2rem',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          gap: '1.5rem',
        }}>
          {[
            { to: '/college-dashboard/my-profile', label: 'My Profile' },
            { to: '/college-dashboard/profile', label: 'Book Test Center' },
            { to: '/college-dashboard/bookings', label: 'Booking History' },
            { to: '/college-dashboard/upload', label: 'Upload CSV' },
            { to: '/college-dashboard/retrieve', label: 'View Students' },
            { to: '/college-dashboard/assign', label: 'Assign Test Centers' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'color 0.2s ease, background-color 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#4f46e5';
                e.target.style.backgroundColor = '#f5f5ff';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <main style={{
        maxWidth: '1280px',
        margin: '2rem auto',
        padding: '0 2rem',
      }}>
        <Routes>
          <Route
            path="my-profile"
            element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}>
                    {error}
                  </div>
                )}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                }}>
                  {editMode ? (
                    <form
                      onSubmit={handleSubmit}
                      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                      {collegeDetails.map((detail) => (
                        <div style={formGroupStyle} key={detail.key}>
                          <label style={labelStyle}>
                            {detail.key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            name={detail.key}
                            type={detail.isNumber ? 'number' : 'text'}
                            value={profile[detail.key] || (detail.isNumber ? 0 : '')}
                            onChange={handleChange}
                            placeholder={detail.key.replace(/([A-Z])/g, ' $1').trim()}
                            style={getInputStyle(detail.key, hoveredInput, focusedInput)}
                            onMouseEnter={() => setHoveredInput(detail.key)}
                            onMouseLeave={() => setHoveredInput(null)}
                            onFocus={() => setFocusedInput(detail.key)}
                            onBlur={() => setFocusedInput(null)}
                          />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="submit"
                          style={getButtonStyle(isHovered)}
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          style={{
                            ...getButtonStyle(isHovered),
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                          }}
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2a44',
                      }}>College Profile</h3>
                      {collegeDetails.map((detail) => (
                        <p key={detail.key} style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginTop: '0.25rem',
                        }}>
                          <span style={{ fontWeight: '500' }}>
                            {detail.key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>{' '}
                          {detail.value}
                        </p>
                      ))}
                      <button
                        onClick={() => setEditMode(true)}
                        style={getButtonStyle(isHovered)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            }
          />
          <Route
            path="profile"
            element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}>
                    {error}
                  </div>
                )}
                <BookingForm token={token} collegeId={collegeId} onBookingUpdate={handleBookingUpdate} />
              </div>
            }
          />
          <Route
            path="bookings"
            element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}>
                    {error}
                  </div>
                )}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2a44',
                    marginBottom: '1rem',
                  }}>Booking History</h3>
                  {profile.BookedDates.length === 0 ? (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                    }}>No bookings yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {profile.BookedDates.map((booking, dateIndex) => (
                        <div
                          key={dateIndex}
                          style={{
                            paddingBottom: '1rem',
                            borderBottom: dateIndex < profile.BookedDates.length - 1 ? '1px solid #e5e7eb' : 'none',
                          }}
                        >
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#1f2a44',
                          }}>
                            Date: {formatDate(booking.Date)}
                          </p>
                          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {booking.Slots.map((slot, slotIndex) => (
                              <div
                                key={slot.Slot}
                                style={{
                                  backgroundColor: '#f9fafb',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                }}
                              >
                                <p style={{
                                  fontSize: '0.875rem',
                                  color: '#6b7280',
                                }}>
                                  <span style={{ fontWeight: '500' }}>Test Center:</span>{' '}
                                  {slot.TestCenterId?.TestCenterName || 'Unknown'} (
                                  {slot.TestCenterId?.Location || 'Unknown'})
                                </p>
                                <p style={{
                                  fontSize: '0.875rem',
                                  color: '#6b7280',
                                  marginTop: '0.25rem',
                                }}>
                                  {slot.Slot}: {slot.SeatsBooked} seats booked
                                </p>
                                {editingBooking &&
                                editingBooking._id === slot.BookingId &&
                                editingBooking.TestCenters[0].BookingDates[0].Slots[0].Slot === slot.Slot ? (
                                  <div style={{
                                    marginTop: '0.75rem',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'center',
                                  }}>
                                    <input
                                      type="number"
                                      value={
                                        editingBooking.TestCenters[0].BookingDates[0].Slots[0].SeatsToBook
                                      }
                                      onChange={handleBookingChange}
                                      min="1"
                                      style={getInputStyle('seats', hoveredInput, focusedInput)}
                                      onMouseEnter={() => setHoveredInput('seats')}
                                      onMouseLeave={() => setHoveredInput(null)}
                                      onFocus={() => setFocusedInput('seats')}
                                      onBlur={() => setFocusedInput(null)}
                                    />
                                    <button
                                      onClick={handleSaveBooking}
                                      style={getButtonStyle(isHovered)}
                                      onMouseEnter={() => setIsHovered(true)}
                                      onMouseLeave={() => setIsHovered(false)}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingBooking(null)}
                                      style={{
                                        ...getButtonStyle(isHovered),
                                        backgroundColor: '#e5e7eb',
                                        color: '#374151',
                                      }}
                                      onMouseEnter={() => setIsHovered(true)}
                                      onMouseLeave={() => setIsHovered(false)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleEditBooking(dateIndex, slotIndex)}
                                    style={getButtonStyle(isHovered)}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                  >
                                    Edit Booking
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            }
          />
          <Route path="upload" element={<Upload token={token} collegeId={collegeId} />} />
          <Route path="retrieve" element={<Retrieve token={token} collegeId={collegeId} />} />
          <Route path="assign" element={<AssignTestCenters token={token} collegeId={collegeId} />} />
          <Route path="/" element={
            <div style={{
              fontSize: '1rem',
              color: '#6b7280',
              textAlign: 'center',
              padding: '2rem',
            }}>
              Welcome to the College Dashboard
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default CollegeDashboard;