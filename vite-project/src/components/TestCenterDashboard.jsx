import React, { useState, useEffect } from "react";
import { getProfile, updateProfile, getAvailability, getBookingHistory, updateBooking } from "../api";

function TestCenterDashboard({ token, testCenterId, onLogout }) {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [availability, setAvailability] = useState({ TotalVaccancy: 0, BookingAvailableSeats: [] });
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const profileData = await getProfile("test-center", token);
      const availabilityData = await getAvailability(token);
      const { data: historyData } = await getBookingHistory(token);
      setProfile(profileData.data);
      setAvailability(availabilityData.data);
      setHistory(historyData);
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: name === "TotalVaccancy" ? parseInt(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile("test-center", token, profile);
    setEditMode(false);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditBooking = (booking) => {
    const bookingData = {
      _id: booking._id || booking.Timestamp,
      TestCenters: [
        {
          TestCenterId: testCenterId,
          BookingDates: [
            {
              Date: booking.BookingDate,
              Slots: booking.Slots.map((slot) => ({ Slot: slot.Slot, SeatsToBook: slot.SeatsBooked })),
            },
          ],
        },
      ],
    };
    setEditingBooking(bookingData);
  };

  const handleBookingChange = (e, slotIndex) => {
    const { value } = e.target;
    const updatedBooking = { ...editingBooking };
    updatedBooking.TestCenters[0].BookingDates[0].Slots[slotIndex].SeatsToBook = parseInt(value);
    setEditingBooking(updatedBooking);
  };

  const handleSaveBooking = async () => {
    try {
      await updateBooking(token, editingBooking._id, editingBooking);
      setHistory((prev) =>
        prev.map((b) =>
          new Date(b.BookingDate).toISOString() === new Date(editingBooking.TestCenters[0].BookingDates[0].Date).toISOString()
            ? {
                ...b,
                Slots: editingBooking.TestCenters[0].BookingDates[0].Slots.map((s) => ({
                  Slot: s.Slot,
                  SeatsBooked: s.SeatsToBook,
                })),
              }
            : b
        )
      );
      setEditingBooking(null);
      alert("Booking updated successfully!");
    } catch (err) {
      alert("Failed to update booking: " + err.response.data.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f7fb',
      fontFamily: "'Inter', sans-serif",
      color: '#1f2a44',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        padding: '2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2a44',
          }}>Test Center Dashboard</h2>
          <button
            onClick={onLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ff4d4f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
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

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          {editMode ? (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {Object.keys(profile).map(
                (key) =>
                  key !== "_id" &&
                  key !== "__v" &&
                  key !== "BookingAvailableSeats" &&
                  key !== "BookingHistory" &&
                  key !== "NormalVaccancy" && (
                    <div key={key}>
                      <label style={{
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.25rem',
                      }}>
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <input
                        type={key === "TotalVaccancy" ? "number" : "text"}
                        name={key}
                        value={profile[key] || ""}
                        onChange={handleChange}
                        placeholder={key.replace(/([A-Z])/g, " $1").trim()}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          color: '#1f2a44',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  )
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
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
                    fontSize: '1rem',
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
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2a44',
              }}>Profile Details</h3>
              {Object.keys(profile).map(
                (key) =>
                  key !== "_id" &&
                  key !== "__v" &&
                  key !== "BookingAvailableSeats" &&
                  key !== "BookingHistory" &&
                  key !== "NormalVaccancy" && (
                    <p key={key} style={{
                      fontSize: '1rem',
                      color: '#6b7280',
                    }}>
                      <span style={{ fontWeight: '500' }}>{key.replace(/([A-Z])/g, " $1").trim()}:</span> {profile[key]}
                    </p>
                  )
              )}
              <button
                onClick={() => setEditMode(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
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

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2a44',
            marginBottom: '1rem',
          }}>Current Availability</h3>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            marginBottom: '1rem',
          }}>
            <span style={{ fontWeight: '500' }}>Total Vacancy:</span> {availability.TotalVaccancy}
          </p>
          {availability.BookingAvailableSeats.length === 0 ? (
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
            }}>No available dates or slots.</p>
          ) : (
            availability.BookingAvailableSeats.map((entry) => (
              <div key={entry.BookingDate} style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#1f2a44',
                }}>
                  Date: {new Date(entry.BookingDate).toLocaleDateString()}
                </p>
                {entry.Slots.map((slot) => (
                  <p key={slot.Slot} style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    marginLeft: '1rem',
                    marginTop: '0.25rem',
                  }}>
                    {slot.Slot}: {slot.AvailableSeats} seats available
                  </p>
                ))}
              </div>
            ))
          )}
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2a44',
            marginBottom: '1rem',
          }}>Booking History</h3>
          {history.length === 0 ? (
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
            }}>No bookings yet.</p>
          ) : (
            history.map((booking) => (
              <div
                key={booking.Timestamp}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleExpand(booking.Timestamp)}
                >
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#1f2a44',
                  }}>
                    <span style={{ fontWeight: '600', color: '#4f46e5' }}>{booking.CollegeId.CollegeName}</span> -{" "}
                    <span style={{ fontWeight: '600', color: '#4f46e5' }}>{new Date(booking.BookingDate).toLocaleDateString()}</span> -{" "}
                    {booking.Slots.map((slot) => (
                      <span key={slot.Slot} style={{ fontWeight: '600', color: '#4f46e5' }}>
                        {slot.Slot} ({slot.SeatsBooked} seats)
                      </span>
                    ))}
                  </p>
                  <span style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                  }}>{expanded[booking.Timestamp] ? "▲" : "▼"}</span>
                </div>
                {editingBooking && editingBooking.TestCenters[0].BookingDates[0].Date === booking.BookingDate ? (
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    {editingBooking.TestCenters[0].BookingDates[0].Slots.map((slot, slotIndex) => (
                      <input
                        key={slot.Slot}
                        type="number"
                        value={slot.SeatsToBook}
                        onChange={(e) => handleBookingChange(e, slotIndex)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          color: '#1f2a44',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    ))}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={handleSaveBooking}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#4f46e5',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                      >
                        Save Booking
                      </button>
                      <button
                        onClick={() => setEditingBooking(null)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#e5e7eb',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
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
                  </div>
                ) : (
                  <>
                    {expanded[booking.Timestamp] && (
                      <div style={{
                        marginTop: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Exam:</span> {booking.CollegeId.CollegeConductingExamName}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Eligibility:</span> {booking.CollegeId.ExamEligibilityQualification}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Fees:</span> {booking.CollegeId.ExamFees}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Nationality:</span> {booking.CollegeId.Nationality}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Age Limit:</span> {booking.CollegeId.AgeLimit}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Subject Eligibility:</span> {booking.CollegeId.SubjectEligibility}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Programmes Offered:</span> {booking.CollegeId.ProgrammesOffered}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Previous Year Cut Off:</span> {booking.CollegeId.PreviousYearCutOff}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Syllabus:</span> {booking.CollegeId.ExamSyllabus}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Seat Availability:</span> {booking.CollegeId.SeatAvailablity}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Exam Duration:</span> {booking.CollegeId.ExamDuration} mins
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Pattern:</span> {booking.CollegeId.ExamPattern}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Type:</span> {booking.CollegeId.ExamType}
                        </p>
                        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Mode:</span> {booking.CollegeId.ExamMode}
                        </p>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        >
                          Edit Booking
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TestCenterDashboard;