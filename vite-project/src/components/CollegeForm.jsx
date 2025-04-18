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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: name === "ExamFees" || name === "AgeLimit" || name === "PreviousYearCutOff" || name === "ExamDuration" ? parseInt(value) || 0 : value };
    if (name === "ExamSlots") newData[name] = value.split(",").map((s) => s.trim()).filter(Boolean);
    setFormData(newData);
    onChange(newData);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a202c', textAlign: 'center', marginBottom: '1.5rem' }}>College Authority Form</h2>
        {Object.keys(formData).map((key) => (
          <div key={key} style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '0.5rem' }}>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </label>
            <input
              type={key.includes("Fees") || key.includes("Age") || key.includes("CutOff") || key.includes("Duration") ? "number" : "text"}
              name={key}
              placeholder={key.replace(/([A-Z])/g, " $1").trim()}
              value={formData[key]}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#2d3748',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#63b3ed'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollegeForm;