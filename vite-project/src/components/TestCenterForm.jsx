import React, { useState, useRef, useEffect } from "react";

const formGroupStyle = { marginBottom: "1.5rem" };

const labelStyle = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "rgb(124, 176, 255)",
  marginBottom: "0.5rem",
  display: "block",
};

const inputStyle = {
  padding: "0.65rem 0",
  border: "none",
  borderBottom: "1px solid #ccc",
  fontSize: "0.95rem",
  backgroundColor: "transparent",
  color: "#333",
  outline: "none",
  transition: "all 0.3s ease-in-out",
  caretColor: "#00ddeb",
};

const dropdownContainerStyle = {
  position: "relative",
  width: "100%",
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
  border: "1px solid #00ddeb", // Subtle cyan border
  background: "#e0ffff", // Light cyan background, matching the image
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)", // Softer shadow for a clean look
};

const calendarContainerStyle = {
  position: "absolute",
  top: "calc(100% + 4px)", // Position below the trigger
  left: 0,
  right: 0,
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
  padding: "1rem",
  zIndex: 100,
  transformOrigin: "top", // Scale animation from top
  transition: "transform 0.25s ease-out, opacity 0.25s ease-out",
  transform: "scaleY(0)",
  opacity: 0,
};

const calendarContainerOpenStyle = {
  transform: "scaleY(1)",
  opacity: 1,
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
  backgroundColor: "rgba(199,210,254,0.5)", // Slightly transparent to match image
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

const getDropdownTriggerStyle = (inputName, hoveredInput, focusedInput) => ({
  ...dropdownTriggerStyle,
  ...(hoveredInput === inputName ? dropdownTriggerHoverStyle : {}),
  ...(focusedInput === inputName ? dropdownTriggerFocusStyle : {}),
});

// Animation keyframes
const calendarKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

function TestCenterForm({ onChange }) {
  const [formData, setFormData] = useState({
    CenterID: "",
    TestCenterName: "",
    Location: "",
    NormalVaccancy: 0,
    AvailableDates: [],
    AvailableSlots: [],
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [hoveredInput, setHoveredInput] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const calendarRef = useRef(null);

  // Utility to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleDateSelect = (date) => {
    const formattedDate = formatDate(date);
    let updatedDates;
    if (formData.AvailableDates.includes(formattedDate)) {
      updatedDates = formData.AvailableDates.filter((d) => d !== formattedDate);
    } else {
      updatedDates = [...formData.AvailableDates, formattedDate];
    }
    const newData = { ...formData, AvailableDates: updatedDates };
    setFormData(newData);
    onChange(newData);
  };

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: name === "NormalVaccancy" ? parseInt(value) || 0 : value,
    };

    if (name === "AvailableSlots") {
      newData[name] = value.split(",").map((s) => s.trim()).filter(Boolean);
    }

    setFormData(newData);
    onChange(newData);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div>
      <style>{calendarKeyframes}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {Object.keys(formData).map((key) =>
          key === "AvailableDates" ? (
            <div key={key} style={formGroupStyle}>
              <label style={labelStyle}>Available Dates</label>
              <div style={dropdownContainerStyle} ref={calendarRef}>
                <button
                  type="button"
                  style={getDropdownTriggerStyle("dates", hoveredInput, focusedInput)}
                  onClick={toggleCalendar}
                  onMouseEnter={() => setHoveredInput("dates")}
                  onMouseLeave={() => setHoveredInput(null)}
                  onFocus={() => setFocusedInput("dates")}
                  onBlur={() => setFocusedInput(null)}
                >
                  <span>
                    {formData.AvailableDates.length > 0
                      ? formData.AvailableDates.join(", ")
                      : "Select Available Dates"}
                  </span>
                  <svg
                    style={{ ...caretStyle, ...(isCalendarOpen ? caretOpenStyle : {}) }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {isCalendarOpen && (
                  <div style={{ ...calendarContainerStyle, ...calendarContainerOpenStyle }}>
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
                        const isSelected = date && formData.AvailableDates.includes(formatDate(date));
                        const isAvailable = !!date; // All dates are selectable
                        return (
                          <div
                            key={index}
                            style={{
                              ...calendarDateStyle,
                              ...(isAvailable ? calendarDateAvailableStyle : calendarDateDisabledStyle),
                              ...(isSelected ? calendarDateSelectedStyle : {}),
                            }}
                            onClick={() => isAvailable && handleDateSelect(date)}
                            onMouseEnter={(e) =>
                              isAvailable && Object.assign(e.currentTarget.style, calendarDateHoverStyle)
                            }
                            onMouseLeave={(e) =>
                              isAvailable &&
                              Object.assign(
                                e.currentTarget.style,
                                isSelected ? calendarDateSelectedStyle : calendarDateAvailableStyle
                              )
                            }
                          >
                            {date ? date.getDate() : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={key} style={{ display: "flex", flexDirection: "column" }}>
              <label style={labelStyle}>{key.replace(/([A-Z])/g, " $1").trim()}</label>
              <input
                type={key === "NormalVaccancy" ? "number" : "text"}
                name={key}
                placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim()}`}
                value={Array.isArray(formData[key]) ? formData[key].join(", ") : formData[key]}
                onChange={handleChange}
                style={inputStyle}
                onFocus={() => setIsCalendarOpen(false)} // Hide calendar when focusing other inputs
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default TestCenterForm;