import React, { useState, useEffect, useRef } from "react";
import { getTestCenters, bookTestCenter } from "../api";
import toast, { Toaster } from "react-hot-toast";


const formGroupStyle = { marginBottom: "1.5rem" };

const inputStyle = {
  width: "90%",
  marginLeft: "30px",
  marginRight: "10px",
  padding: "0.75rem 0",
  border: "none",
  borderBottom: "1px solid #ccc",
  fontSize: "0.95rem",
  backgroundColor: "transparent",
  color: "#1f2a44",
  outline: "none",
  transition: "all 0.3s ease-in-out",
  caretColor: "#00ddeb",
};

const inputHoverStyle = {
  borderBottom: "1px solid #a5b4fc",
};

const inputFocusStyle = {
  borderBottom: "1px solid #6366f1",
  fontWeight: "bold",
};

const labelStyle = {
  fontSize: "1rem",
  fontWeight: "700",
  color: "#4f46e5",
  marginBottom: "0.5rem",
  display: "block",
};

const buttonStyle = {
  width: "100%",
  padding: "0.85rem",
  backgroundColor: "#4f46e5",
  color: "white",
  fontWeight: "bold",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s ease, transform 0.2s ease",
};

const buttonHoverStyle = {
  backgroundColor: "#4338ca",
  transform: "scale(1.02)",
};

// Enhanced dropdown styles
const dropdownContainerStyle = {
  position: "relative",
  width: "90%",
  marginLeft: "30px",
  marginRight: "10px",
};

const dropdownTriggerStyle = {
  width: "100%",
  padding: "0.75rem 2.5rem 0.75rem 1rem",
  border: "none",
  borderBottom: "1px solid transparent",
  background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(243,244,246,0.95))",
  color: "#1f2a44",
  fontSize: "0.95rem",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  transition: "all 0.3s ease-in-out",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const dropdownTriggerHoverStyle = {
  borderBottom: "1px solid #a5b4fc",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1), 0 0 0 3px rgba(79,70,229,0.1)",
};

const dropdownTriggerFocusStyle = {
  borderBottom: "1px solid #6366f1",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1), 0 0 0 3px rgba(79,70,229,0.2)",
};

const dropdownMenuStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
  maxHeight: "240px",
  overflowY: "auto",
  zIndex: 20,
  transformOrigin: "top",
  transition: "transform 0.25s ease-out, opacity 0.25s ease-out",
  transform: "scaleY(0)",
  opacity: 0,
};

const dropdownMenuOpenStyle = {
  transform: "scaleY(1)",
  opacity: 1,
};

const dropdownOptionStyle = {
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  color: "#1f2a44",
  cursor: "pointer",
  transition: "background-color 0.2s ease, transform 0.2s ease",
};

const dropdownOptionHoverStyle = {
  backgroundColor: "#f5f5ff",
  transform: "scale(1.03)",
};

// Calendar styles
const calendarContainerStyle = {
  width: "90%",
  marginLeft: "30px",
  marginRight: "10px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  padding: "1rem",
  animation: "fadeIn 0.3s ease-out",
};

const calendarHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const calendarNavButtonStyle = {
  padding: "0.5rem",
  backgroundColor: "transparent",
  border: "none",
  color: "#4f46e5",
  fontSize: "1.25rem",
  cursor: "pointer",
  transition: "color 0.2s ease",
};

const calendarNavButtonHoverStyle = {
  color: "#4338ca",
};

const calendarGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "4px",
};

const calendarDayStyle = {
  padding: "0.5rem",
  textAlign: "center",
  fontSize: "0.875rem",
  color: "#1f2a44",
  fontWeight: "600",
};

const calendarDateStyle = {
  padding: "0.5rem",
  textAlign: "center",
  fontSize: "0.875rem",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "background-color 0.2s ease, transform 0.2s ease",
};

const calendarDateAvailableStyle = {
  backgroundColor: "#e0e7ff",
  color: "#1f2a44",
};

const calendarDateSelectedStyle = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  transform: "scale(1.1)",
};

const calendarDateDisabledStyle = {
  color: "#d1d5db",
  backgroundColor: "transparent",
  cursor: "not-allowed",
};

const calendarDateHoverStyle = {
  backgroundColor: "#c7d2fe",
  transform: "scale(1.05)",
};

const caretStyle = {
  width: "16px",
  height: "16px",
  transition: "transform 0.25s ease, scale 0.25s ease",
};

const caretOpenStyle = {
  transform: "rotate(180deg) scale(1.1)",
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

const getDropdownTriggerStyle = (inputName, hoveredInput, focusedInput) => ({
  ...dropdownTriggerStyle,
  ...(hoveredInput === inputName ? dropdownTriggerHoverStyle : {}),
  ...(focusedInput === inputName ? dropdownTriggerFocusStyle : {}),
});

// Animation keyframes
const calendarKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

function BookingForm({ token, collegeId, onBookingUpdate }) {
  const [testCenters, setTestCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [seatsToBook, setSeatsToBook] = useState(0);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hoveredInput, setHoveredInput] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const centerRef = useRef(null);
  const slotRef = useRef(null);

  // Utility to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Load form state from local storage on mount
  useEffect(() => {
    const savedState = {
      selectedCenter: localStorage.getItem("booking_selectedCenter") || "",
      selectedDate: localStorage.getItem("booking_selectedDate") || "",
      selectedSlot: localStorage.getItem("booking_selectedSlot") || "",
      seatsToBook: parseInt(localStorage.getItem("booking_seatsToBook")) || 0,
    };
    setSelectedCenter(savedState.selectedCenter);
    setSelectedDate(savedState.selectedDate);
    setSelectedSlot(savedState.selectedSlot);
    setSeatsToBook(savedState.seatsToBook);
    if (savedState.selectedDate) {
      setCurrentMonth(new Date(savedState.selectedDate));
    }
  }, []);

  // Save form state to local storage on change
  useEffect(() => {
    localStorage.setItem("booking_selectedCenter", selectedCenter);
    localStorage.setItem("booking_selectedDate", selectedDate);
    localStorage.setItem("booking_selectedSlot", selectedSlot);
    localStorage.setItem("booking_seatsToBook", seatsToBook.toString());
  }, [selectedCenter, selectedDate, selectedSlot, seatsToBook]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        centerRef.current && !centerRef.current.contains(event.target) &&
        slotRef.current && !slotRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTestCenters = async () => {
    try {
      const { data } = await getTestCenters();
      if (Array.isArray(data)) {
        setTestCenters(data);
        console.log("Fetched test centers:", data); // Debug log
      } else {
        console.error("Unexpected API response:", data);
        setTestCenters([]);
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Failed to fetch test centers:", error);
      toast.error("Failed to fetch test centers.");
    }
  };

  useEffect(() => {
    fetchTestCenters();
  }, []);

  useEffect(() => {
    if (!selectedCenter || !selectedDate || !selectedSlot || !testCenters.length) {
      setAvailableSeats(0);
      return;
    }

    const center = testCenters.find((c) => c._id === selectedCenter);
    if (!center) {
      console.log("No center found for ID:", selectedCenter); // Debug log
      setAvailableSeats(0);
      return;
    }

    const dateEntry = center.BookingAvailableSeats?.find(
      (entry) => formatDate(entry.BookingDate) === selectedDate
    );
    if (!dateEntry) {
      console.log("No date entry found for:", selectedDate); // Debug log
      setAvailableSeats(0);
      return;
    }

    const slotEntry = dateEntry.Slots?.find((s) => s.Slot === selectedSlot);
    if (!slotEntry) {
      console.log("No slot entry found for:", selectedSlot); // Debug log
      setAvailableSeats(0);
      return;
    }

    console.log("Setting available seats:", slotEntry.AvailableSeats); // Debug log
    setAvailableSeats(slotEntry.AvailableSeats || 0);
  }, [selectedCenter, selectedDate, selectedSlot, testCenters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (seatsToBook <= 0 || seatsToBook > availableSeats) {
      toast.error(`Please book between 1 and ${availableSeats} seats.`);
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
      Colleges: [collegeId],
    };

    try {
      const { data } = await bookTestCenter(token, bookingData);
      await fetchTestCenters();
      onBookingUpdate(data.booking);
      toast.success("Booking successful!");

      // Clear form and local storage
      setSelectedCenter("");
      setSelectedDate("");
      setSelectedSlot("");
      setSeatsToBook(0);
      localStorage.removeItem("booking_selectedCenter");
      localStorage.removeItem("booking_selectedDate");
      localStorage.removeItem("booking_selectedSlot");
      localStorage.removeItem("booking_seatsToBook");
    } catch (err) {
      console.error("Booking failed:", err.response?.data?.error || err.message);
      toast.error(err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const selectOption = (dropdown, value, setter) => {
    console.log(`Selecting ${dropdown}:`, value); // Debug log
    setter(value);
    setOpenDropdown(null);
  };

  const getDisplayValue = (dropdown) => {
    if (dropdown === "center" && selectedCenter) {
      const center = testCenters.find((c) => c._id === selectedCenter);
      return center ? `${center.TestCenterName} - ${center.Location}` : "Select Test Center";
    }
    if (dropdown === "slot" && selectedSlot) {
      const center = testCenters.find((c) => c._id === selectedCenter);
      const dateEntry = center?.BookingAvailableSeats?.find(
        (entry) => formatDate(entry.BookingDate) === selectedDate
      );
      const slotEntry = dateEntry?.Slots?.find((s) => s.Slot === selectedSlot);
      return slotEntry ? `${slotEntry.Slot} (${slotEntry.AvailableSeats} seats)` : "Select Slot";
    }
    return `Select ${dropdown.charAt(0).toUpperCase() + dropdown.slice(1)}`;
  };

  // Calendar logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateAvailable = (date) => {
    if (!selectedCenter || !date) return false;
    const center = testCenters.find((c) => c._id === selectedCenter);
    const formattedDate = formatDate(date);
    const isAvailable = center?.BookingAvailableSeats.some(
      (entry) => formatDate(entry.BookingDate) === formattedDate
    );
    console.log(`Checking date ${formattedDate}: ${isAvailable}`); // Debug log
    return isAvailable;
  };

  const handleDateSelect = (date) => {
    if (isDateAvailable(date)) {
      const formattedDate = formatDate(date);
      console.log("Selected date:", formattedDate); // Debug log
      setSelectedDate(formattedDate);
      setSelectedSlot(""); // Reset slot when date changes
    }
  };

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{ marginTop: "30px", padding: "20px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <style>{calendarKeyframes}</style>
      <Toaster position="top-center" />
      <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2a44", marginBottom: "1rem" }}>Book Test Center</h3>
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Test Center</label>
          <div style={dropdownContainerStyle} ref={centerRef}>
            <button
              type="button"
              style={getDropdownTriggerStyle("center", hoveredInput, focusedInput)}
              onClick={() => toggleDropdown("center")}
              onMouseEnter={() => setHoveredInput("center")}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={() => setFocusedInput("center")}
              onBlur={() => setFocusedInput(null)}
              disabled={loading}
            >
              <span>{getDisplayValue("center")}</span>
              <svg style={{ ...caretStyle, ...(openDropdown === "center" ? caretOpenStyle : {}) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {openDropdown === "center" && (
              <ul style={{ ...dropdownMenuStyle, ...dropdownMenuOpenStyle }}>
                {testCenters.map((center) => (
                  <li
                    key={center._id}
                    style={dropdownOptionStyle}
                    onClick={() => selectOption("center", center._id, setSelectedCenter)}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownOptionHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownOptionStyle)}
                  >
                    {center.TestCenterName} - {center.Location}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {selectedCenter && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>Date</label>
            <div style={calendarContainerStyle}>
              <div style={calendarHeaderStyle}>
                <button
                  type="button"
                  style={calendarNavButtonStyle}
                  onClick={() => changeMonth(-1)}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, calendarNavButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, calendarNavButtonStyle)}
                >
                  ←
                </button>
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "#1f2a44" }}>
                  {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  style={calendarNavButtonStyle}
                  onClick={() => changeMonth(1)}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, calendarNavButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, calendarNavButtonStyle)}
                >
                  →
                </button>
              </div>
              <div style={calendarGridStyle}>
                {weekdays.map((day) => (
                  <div key={day} style={calendarDayStyle}>
                    {day}
                  </div>
                ))}
                {daysInMonth.map((date, index) => {
                  const isAvailable = date && isDateAvailable(date);
                  const isSelected = date && selectedDate === formatDate(date);
                  return (
                    <div
                      key={index}
                      style={{
                        ...calendarDateStyle,
                        ...(isAvailable ? calendarDateAvailableStyle : calendarDateDisabledStyle),
                        ...(isSelected ? calendarDateSelectedStyle : {}),
                      }}
                      onClick={() => isAvailable && handleDateSelect(date)}
                      onMouseEnter={(e) => isAvailable && Object.assign(e.currentTarget.style, calendarDateHoverStyle)}
                      onMouseLeave={(e) => isAvailable && Object.assign(e.currentTarget.style, isSelected ? calendarDateSelectedStyle : calendarDateAvailableStyle)}
                    >
                      {date ? date.getDate() : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedDate && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>Slot</label>
            <div style={dropdownContainerStyle} ref={slotRef}>
              <button
                type="button"
                style={getDropdownTriggerStyle("slot", hoveredInput, focusedInput)}
                onClick={() => toggleDropdown("slot")}
                onMouseEnter={() => setHoveredInput("slot")}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={() => setFocusedInput("slot")}
                onBlur={() => setFocusedInput(null)}
                disabled={loading}
              >
                <span>{getDisplayValue("slot")}</span>
                <svg style={{ ...caretStyle, ...(openDropdown === "slot" ? caretOpenStyle : {}) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {openDropdown === "slot" && (
                <ul style={{ ...dropdownMenuStyle, ...dropdownMenuOpenStyle }}>
                  {(() => {
                    const center = testCenters.find((c) => c._id === selectedCenter);
                    const dateEntry = center?.BookingAvailableSeats.find(
                      (entry) => formatDate(entry.BookingDate) === selectedDate
                    );
                    console.log("Slot date entry:", dateEntry); // Debug log
                    return dateEntry?.Slots.map((slot) => (
                      <li
                        key={slot.Slot}
                        style={dropdownOptionStyle}
                        onClick={() => selectOption("slot", slot.Slot, setSelectedSlot)}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownOptionHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownOptionStyle)}
                      >
                        {slot.Slot} ({slot.AvailableSeats} seats)
                      </li>
                    )) || [];
                  })()}
                </ul>
              )}
            </div>
          </div>
        )}

        {selectedSlot && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>Seats to Book (Max: {availableSeats})</label>
            <input
              type="number"
              value={seatsToBook}
              onChange={(e) => setSeatsToBook(Math.max(1, Math.min(parseInt(e.target.value) || 0, availableSeats)))}
              max={availableSeats}
              min="1"
              style={getInputStyle("seats", hoveredInput, focusedInput)}
              disabled={loading}
              onMouseEnter={() => setHoveredInput("seats")}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={() => setFocusedInput("seats")}
              onBlur={() => setFocusedInput(null)}
            />
          </div>
        )}

        <button
          type="submit"
          style={getButtonStyle(isHovered)}
          disabled={loading || !selectedSlot}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;