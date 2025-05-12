import React, { useState, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';


const formGroupStyle = { marginBottom: "1.5rem" };

const inputStyle = {
  width: '90%',
  margin: '0 auto',
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '0.95rem',
  backgroundColor: '#fafafa',
  color: '#1f2a44',
  outline: 'none',
  transition: 'all 0.3s ease-in-out',
  resize: 'vertical',
};

const inputHoverStyle = {
  borderColor: '#2563eb',
};

const inputFocusStyle = {
  borderColor: '#1e40af',
  boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
};

const buttonStyle = {
  padding: '0.85rem',
  backgroundColor: '#2563eb',
  color: 'white',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
};

const buttonHoverStyle = {
  backgroundColor: '#1e40af',
  transform: 'scale(1.02)',
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#4f46e5',
};

const secondaryButtonHoverStyle = {
  ...buttonHoverStyle,
  backgroundColor: '#4338ca',
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#e5e7eb',
  color: '#374151',
};

const cancelButtonHoverStyle = {
  ...buttonHoverStyle,
  backgroundColor: '#d1d5db',
};

const popupStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  padding: '2rem',
  maxWidth: '90%',
  maxHeight: '80vh',
  overflowY: 'auto',
  zIndex: 1000,
  animation: 'fadeInScale 0.3s ease-out',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 999,
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '1.5rem',
};

const thStyle = {
  padding: '0.75rem',
  backgroundColor: '#f4f7fb',
  fontWeight: '600',
  color: '#1f2a44',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #e5e7eb',
  color: '#6b7280',
};

const trHoverStyle = {
  backgroundColor: '#f5f5ff',
};

const checkboxStyle = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
  accentColor: '#2563eb',
};

const getInputStyle = (isHovered, isFocused) => ({
  ...inputStyle,
  ...(isHovered ? inputHoverStyle : {}),
  ...(isFocused ? inputFocusStyle : {}),
});

const getButtonStyle = (isHovered) => ({
  ...buttonStyle,
  ...(isHovered ? buttonHoverStyle : {}),
});

const getSecondaryButtonStyle = (isHovered) => ({
  ...secondaryButtonStyle,
  ...(isHovered ? secondaryButtonHoverStyle : {}),
});

const getCancelButtonStyle = (isHovered) => ({
  ...cancelButtonStyle,
  ...(isHovered ? cancelButtonHoverStyle : {}),
});

// Animation keyframes
const keyframes = `
  @keyframes fadeInScale {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
`;

function Upload({ token, collegeId }) {
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isConfirmHovered, setIsConfirmHovered] = useState(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [isParseHovered, setIsParseHovered] = useState(false);
  const [isTextHovered, setIsTextHovered] = useState(false);
  const [isTextFocused, setIsTextFocused] = useState(false);
  const fileInputRef = useRef(null);

  // Utility to format date as YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if not a valid date
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.csv')) {
        setFile(droppedFile);
        parseCsv(droppedFile, 'file');
        setMessage('');
      } else {
        setMessage('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(selectedFile);
      parseCsv(selectedFile, 'file');
      setMessage('');
    } else {
      setMessage('Please select a CSV file');
    }
  };

  const handleParseText = () => {
    if (!csvText.trim()) {
      setMessage('Please enter CSV data');
      return;
    }
    parseCsv(csvText, 'text');
    setMessage('');
  };

  const parseCsv = (input, source) => {
    console.log(`Parsing ${source}:`, source === 'file' ? input.name : input.substring(0, 50) + '...'); // Debug log
    const config = {
      complete: (result) => {
        console.log('PapaParse result:', result); // Debug log
        if (result.errors.length > 0) {
          setMessage(`Error parsing CSV: ${result.errors[0].message}`);
          return;
        }
        if (result.data && result.data.length > 0) {
          const headers = result.data[0];
          const rows = result.data.slice(1).filter(row => row.some(cell => cell.trim())); // Skip empty rows
          if (rows.length === 0) {
            setMessage('CSV contains no valid data rows');
            return;
          }
          setCsvData({ headers, rows });
          setSelectedRows(new Array(rows.length).fill(true)); // Select all by default
          setShowPopup(true);
          console.log('CSV data set:', { headers, rows }); // Debug log
        } else {
          setMessage('CSV is empty or invalid');
        }
      },
      error: (error) => {
        console.error('PapaParse error:', error); // Debug log
        setMessage('Error parsing CSV');
      },
      header: false,
      skipEmptyLines: true,
      dynamicTyping: false,
    };

    if (source === 'file') {
      Papa.parse(input, config);
    } else {
      Papa.parse(input, { ...config, delimiter: ',' }); // Explicitly set delimiter for text input
    }
  };

  const toggleRowSelection = (index) => {
    setSelectedRows((prev) =>
      prev.map((selected, i) => (i === index ? !selected : selected))
    );
  };

  const selectAllRows = () => {
    setSelectedRows(new Array(csvData.rows.length).fill(true));
  };

  const deselectAllRows = () => {
    setSelectedRows(new Array(csvData.rows.length).fill(false));
  };

  const handleConfirmSelection = async () => {
    if (selectedRows.every((selected) => !selected)) {
      setMessage('Please select at least one row');
      return;
    }

    const selectedData = csvData.rows
      .filter((_, index) => selectedRows[index])
      .map(row =>
        row.map(cell => {
          const date = new Date(cell);
          return isNaN(date.getTime()) ? cell : formatDate(cell);
        })
      );
    const newCsvData = [csvData.headers, ...selectedData];
    const csvString = Papa.unparse(newCsvData, { quotes: true });
    console.log('Generated CSV:', csvString); // Debug log

    const blob = new Blob([csvString], { type: 'text/csv' });
    const newFile = new File([blob], file?.name || 'manual.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', newFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(response.data.message);
      setFile(null);
      setCsvText('');
      setCsvData([]);
      setSelectedRows([]);
      setShowPopup(false);
      fileInputRef.current.value = '';
      console.log('Upload response:', response.data); // Debug log
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error uploading file';
      setMessage(errorMessage);
      console.error('Upload error:', errorMessage, error.response); // Debug log
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
    setFile(null);
    setCsvText('');
    setCsvData([]);
    setSelectedRows([]);
    setMessage('');
    fileInputRef.current.value = '';
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px 0', fontFamily: "'Inter', sans-serif" }}>
      <style>{keyframes}</style>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2a44', marginBottom: '1rem' }}>
        Upload CSV
      </h3>
      <div style={formGroupStyle}>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="Paste or type CSV data here (e.g., Name,Date,Score\nJohn Doe,2025-04-22,85)"
          rows="8"
          style={getInputStyle(isTextHovered, isTextFocused)}
          onMouseEnter={() => setIsTextHovered(true)}
          onMouseLeave={() => setIsTextHovered(false)}
          onFocus={() => setIsTextFocused(true)}
          onBlur={() => setIsTextFocused(false)}
        />
        <button
          onClick={handleParseText}
          style={getSecondaryButtonStyle(isParseHovered)}
          onMouseEnter={() => setIsParseHovered(true)}
          onMouseLeave={() => setIsParseHovered(false)}
          disabled={!csvText.trim()}
        >
          Parse CSV
        </button>
      </div>
      <form onSubmit={(e) => e.preventDefault()} onDragEnter={handleDrag}>
        <div
          style={{
            border: `2px dashed ${dragActive ? '#2563eb' : '#ccc'}`,
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: dragActive ? '#e8f5ff' : '#fafafa',
            cursor: 'pointer',
            margin: '20px auto',
            maxWidth: '400px',
            transition: 'all 0.3s ease',
          }}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {file ? file.name : 'Drag & drop a CSV file here or click to select'}
          </p>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </form>
      {message && (
        <p style={{ color: message.includes('Error') ? '#dc2626' : '#2563eb', fontSize: '0.875rem' }}>
          {message}
        </p>
      )}

      {showPopup && (
        <>
          <div style={overlayStyle} onClick={handleCancel} />
          <div style={popupStyle}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2a44', marginBottom: '1rem' }}>
              Select Rows to Upload
            </h4>
            {csvData.rows.length === 0 ? (
              <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                No valid data found in CSV
              </p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={selectAllRows}
                    style={getButtonStyle(isConfirmHovered)}
                    onMouseEnter={() => setIsConfirmHovered(true)}
                    onMouseLeave={() => setIsConfirmHovered(false)}
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllRows}
                    style={getCancelButtonStyle(isCancelHovered)}
                    onMouseEnter={() => setIsCancelHovered(true)}
                    onMouseLeave={() => setIsCancelHovered(false)}
                  >
                    Deselect All
                  </button>
                </div>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Select</th>
                      {csvData.headers.map((header, index) => (
                        <th key={index} style={thStyle}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        style={{ backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9fafb' }}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, trHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, {
                          backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9fafb',
                        })}
                      >
                        <td style={tdStyle}>
                          <input
                            type="checkbox"
                            checked={selectedRows[rowIndex]}
                            onChange={() => toggleRowSelection(rowIndex)}
                            style={checkboxStyle}
                          />
                        </td>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} style={tdStyle}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleConfirmSelection}
                style={getButtonStyle(isConfirmHovered)}
                onMouseEnter={() => setIsConfirmHovered(true)}
                onMouseLeave={() => setIsConfirmHovered(false)}
                disabled={csvData.rows.length === 0}
              >
                Confirm Selection
              </button>
              <button
                onClick={handleCancel}
                style={getCancelButtonStyle(isCancelHovered)}
                onMouseEnter={() => setIsCancelHovered(true)}
                onMouseLeave={() => setIsCancelHovered(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Upload;