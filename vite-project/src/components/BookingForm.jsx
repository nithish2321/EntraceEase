import React, { useState, useEffect } from "react";
import { getTestCenters, bookTestCenter } from "../api";

function BookingForm({ token, collegeId, onBookingUpdate }) {
  const [testCenters, setTestCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [seatsToBook, setSeatsToBook] = useState(0);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTestCenters = async () => {
    try {
      const { data } = await getTestCenters();
      if (Array.isArray(data)) {
        setTestCenters(data);
      } else {
        console.error("Unexpected API response:", data);
        setTestCenters([]);
      }
    } catch (error) {
      console.error("Failed to fetch test centers:", error);
      alert("Error fetching test centers.");
    }
  };

  useEffect(() => {
    fetchTestCenters();
  }, []);

  useEffect(() => {
    if (!selectedCenter || !selectedDate || !selectedSlot || !testCenters.length) return;

    const center = testCenters.find((c) => c._id === selectedCenter);
    if (!center) return;

    const dateEntry = center.BookingAvailableSeats?.find(
      (entry) => new Date(entry.BookingDate).toISOString() === new Date(selectedDate).toISOString()
    );
    const slotEntry = dateEntry?.Slots?.find((s) => s.Slot === selectedSlot);

    setAvailableSeats(slotEntry?.AvailableSeats || 0);
  }, [selectedCenter, selectedDate, selectedSlot, testCenters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (seatsToBook <= 0 || seatsToBook > availableSeats) {
      alert(`Please book    book between 1 and ${availableSeats} seats.`);
      return;
    }

    setLoading(true);
    const bookingData = {
      TestCenters: [
        {
          TestCenterId: selectedCenter,
          BookingDates: [{ Date: selectedDate, Slots: [{ Slot: selectedSlot, SeatsToBook: seatsToBook }] }],
        },
      ],
      Colleges: [collegeId], // Ensure array format
    };

    try {
      const { data } = await bookTestCenter(token, bookingData);
      await fetchTestCenters(); // Refresh test centers after booking
      onBookingUpdate(data.booking);
      alert("Booking successful!");

      setSelectedCenter("");
      setSelectedDate("");
      setSelectedSlot("");
      setSeatsToBook(0);
    } catch (err) {
      console.error("Booking failed:", err.response?.data?.error || err.message);
      alert(`Booking failed: ${err.response?.data?.error || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
      <h3 style={{ fontSize: "22px", color: "#333", marginBottom: "20px" }}>Book Test Center</h3>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          style={dropdownStyle}
          disabled={loading}
        >
          <option value="">Select Test Center</option>
          {testCenters.map((center) => (
            <option key={center._id} value={center._id}>
              {center.TestCenterName} - {center.Location}
            </option>
          ))}
        </select>

        {selectedCenter && (
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={dropdownStyle}
            disabled={loading}
          >
            <option value="">Select Date</option>
            {testCenters
              .find((c) => c._id === selectedCenter)
              ?.BookingAvailableSeats.map((entry) => (
                <option key={entry.BookingDate} value={entry.BookingDate}>
                  {new Date(entry.BookingDate).toLocaleDateString()}
                </option>
              ))}
          </select>
        )}

        {selectedDate && (
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            style={dropdownStyle}
            disabled={loading}
          >
            <option value="">Select Slot</option>
            {testCenters
              .find((c) => c._id === selectedCenter)
              ?.BookingAvailableSeats.find(
                (entry) => new Date(entry.BookingDate).toISOString() === new Date(selectedDate).toISOString()
              )
              ?.Slots.map((slot) => (
                <option key={slot.Slot} value={slot.Slot}>
                  {slot.Slot} ({slot.AvailableSeats} seats)
                </option>
              ))}
          </select>
        )}

        {selectedSlot && (
          <input
            type="number"
            placeholder={`Seats to Book (Max: ${availableSeats})`}
            value={seatsToBook}
            onChange={(e) => setSeatsToBook(Math.max(1, Math.min(parseInt(e.target.value) || 0, availableSeats)))}
            max={availableSeats}
            min="1"
            style={inputStyle}
            disabled={loading}
          />
        )}

        <button type="submit" style={buttonStyle} disabled={loading || !selectedSlot}>
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}

const dropdownStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "16px",
  background: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "background 0.3s",
};

export default BookingForm;