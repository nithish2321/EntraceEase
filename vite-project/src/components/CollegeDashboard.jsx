import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, updateBooking } from '../api';
import BookingForm from './BookingForm';
import Upload from './Upload';
import Retrieve from './Retrieve';
import AssignTestCenters from './AssignTestCenters';

function CollegeDashboard({ token, collegeId, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData } = await getProfile('college', token);
        setProfile(profileData || { BookedDates: [] });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setProfile({ BookedDates: [] });
        setError(err.response?.data?.error || 'Failed to load college data. Please try again.');
      }
    };
    fetchData();
  }, [token]);

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
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleBookingUpdate = (newBooking) => {
    const updatedProfile = { ...profile };
    newBooking.TestCenters.forEach((testCenter) => {
      testCenter.BookingDates.forEach((bookingDate) => {
        const existingDate = updatedProfile.BookedDates.find(
          (d) => new Date(d.Date).toDateString() === new Date(bookingDate.Date).toDateString()
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
            Date: bookingDate.Date,
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
              Date: profile.BookedDates[dateIndex].Date,
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
      const formattedEditingDate = new Date(
        editingBooking.TestCenters[0].BookingDates[0].Date
      ).toDateString();
      const updatedProfile = { ...profile };
      const dateIndex = updatedProfile.BookedDates.findIndex(
        (d) => new Date(d.Date).toDateString() === formattedEditingDate
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
      alert('Booking updated successfully!');
    } catch (err) {
      alert('Failed to update booking: ' + (err.response?.data?.error || 'Unknown error'));
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f7fb',
      fontFamily: "'Inter', sans-serif",
      color: '#1f2a44',
    }}>
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
            { to: '/college-dashboard/profile', label: 'Book Test Center' },
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
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '0.25rem',
                        }}>
                          College Name
                        </label>
                        <input
                          name="CollegeName"
                          value={profile.CollegeName || ''}
                          onChange={handleChange}
                          placeholder="College Name"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#1f2a44',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '0.25rem',
                        }}>
                          Exam Fees
                        </label>
                        <input
                          name="ExamFees"
                          type="number"
                          value={profile.ExamFees || 0}
                          onChange={handleChange}
                          placeholder="Exam Fees"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#1f2a44',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="submit"
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d1d5db'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#1f2a44',
                        }}>Profile Details</h3>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginTop: '0.5rem',
                        }}>
                          <span style={{ fontWeight: '500' }}>Name:</span> {profile.CollegeName || 'N/A'}
                        </p>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginTop: '0.25rem',
                        }}>
                          <span style={{ fontWeight: '500' }}>Exam Fees:</span> {profile.ExamFees || 0}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditMode(true)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#4f46e5',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          width: 'fit-content',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>

                <BookingForm token={token} collegeId={collegeId} onBookingUpdate={handleBookingUpdate} />

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
                  }}>Booked Test Centers</h3>
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
                            Date: {new Date(booking.Date).toLocaleDateString()}
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
                                      style={{
                                        width: '100px',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        color: '#1f2a44',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                      }}
                                      onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                    <button
                                      onClick={handleSaveBooking}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#4f46e5',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease',
                                      }}
                                      onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                                      onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingBooking(null)}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#e5e7eb',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease',
                                      }}
                                      onMouseOver={(e) => e.target.style.backgroundColor = '#d1d5db'}
                                      onMouseOut={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleEditBooking(dateIndex, slotIndex)}
                                    style={{
                                      marginTop: '0.75rem',
                                      padding: '0.5rem 1rem',
                                      backgroundColor: '#4f46e5',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '0.875rem',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s ease',
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
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