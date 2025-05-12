import React, { useState } from "react";

function CollegeForm({ onChange }) {
  const [formData, setFormData] = useState({
    CollegeName: "",
    CollegeConductingExamName: "",
    ExamEligibilityQualification: "",
    ExamFees: 0,
    Nationality: "",
    AgeLimit: 0,
    SubjectEligibility: "",
    ProgrammesOffered: "",
    PreviousYearCutOff: 0,
    ExamSyllabus: "",
    SeatAvailablity: "",
    ExamDate: "",
    ExamSlots: [],
    ExamDuration: 0,
    ExamPattern: "",
    ExamType: "",
    ExamMode: "",
  });

  // State to track hover and focus for each input
  const [hoverStates, setHoverStates] = useState(
    Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  const [focusStates, setFocusStates] = useState(
    Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]:
        ["ExamFees", "AgeLimit", "PreviousYearCutOff", "ExamDuration"].includes(name)
          ? parseInt(value) || 0
          : value,
    };
    if (name === "ExamSlots") {
      newData[name] = value.split(",").map((s) => s.trim()).filter(Boolean);
    }
    setFormData(newData);
    onChange(newData);
  };

  // Base input style
  const inputStyle = {
    padding: "0.65rem 0",
    border: "none",
    borderBottom: "1px solid #ccc",
    fontSize: "0.95rem",
    backgroundColor: "transparent",
    color: "#333", // Dark color for visibility on light background
    outline: "none",
    transition: "all 0.3s ease-in-out",
    caretColor: "#00ddeb",
  };

  // Hover and focus styles
  const inputHoverStyle = {
    borderBottom: "1px solid #e0ffff", // Light cyan for hover
  };

  const inputFocusStyle = {
    borderBottom: "1px solid #00ddeb", // Teal for focus, matching the image
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {Object.keys(formData).map((key) => {
          // Combine styles dynamically for each input
          const combinedInputStyle = {
            ...inputStyle,
            ...(hoverStates[key] && !focusStates[key] ? inputHoverStyle : {}),
            ...(focusStates[key] ? inputFocusStyle : {}),
          };

          return (
            <div key={key} style={{ display: "flex", flexDirection: "column" }}>
              <label style={labelStyle}>{key.replace(/([A-Z])/g, " $1").trim()}</label>
              <input
                type={
                  key.includes("Fees") || key.includes("Age") || key.includes("CutOff") || key.includes("Duration")
                    ? "number"
                    : "text"
                }
                name={key}
                placeholder={key.replace(/([A-Z])/g, " $1").trim()}
                value={Array.isArray(formData[key]) ? formData[key].join(", ") : formData[key]}
                onChange={handleChange}
                style={combinedInputStyle}
                onMouseEnter={() => setHoverStates((prev) => ({ ...prev, [key]: true }))}
                onMouseLeave={() => setHoverStates((prev) => ({ ...prev, [key]: false }))}
                onFocus={() => setFocusStates((prev) => ({ ...prev, [key]: true }))}
                onBlur={() => setFocusStates((prev) => ({ ...prev, [key]: false }))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
const labelStyle = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "rgb(124, 176, 255)",
  marginBottom: "0.5rem",
  display: "block",
};

export default CollegeForm;