import React, { useState, useEffect } from "react";
import { getBookingHistory } from "../api";

function BookingHistory({ token }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await getBookingHistory(token);
      setHistory(data);
    };
    fetchHistory();
  }, [token]);

  return (
    <div style={{ marginTop: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
      <h3 style={{ fontSize: "22px", color: "#333", marginBottom: "20px" }}>Booking History</h3>
      {history.length === 0 ? (
        <p style={{ fontSize: "16px", color: "#666" }}>No bookings yet.</p>
      ) : (
        history.map((booking) => (
          <div
            key={booking.Timestamp}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              margin: "10px 0",
              borderRadius: "6px",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: "16px", color: "#333" }}>
              <strong>College:</strong> {booking.CollegeId.CollegeName}
            </p>
            <p style={{ fontSize: "16px", color: "#333" }}>
              <strong>Exam:</strong> {booking.CollegeId.CollegeConductingExamName}
            </p>
            <p style={{ fontSize: "16px", color: "#333" }}>
              <strong>Date:</strong> {new Date(booking.BookingDate).toLocaleDateString()}
            </p>
            {booking.Slots.map((slot) => (
              <p key={slot.Slot} style={{ fontSize: "16px", color: "#555", marginLeft: "20px" }}>
                {slot.Slot}: {slot.SeatsBooked} seats booked
              </p>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default BookingHistory;