import React, { useState, useRef } from 'react';
import axios from 'axios';

function Upload({ token, collegeId }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
      if (droppedFile.type === 'text/csv') {
        setFile(droppedFile);
        setMessage('');
      } else {
        setMessage('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setMessage('Please select a CSV file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select or drop a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(response.data.message);
      setFile(null);
      fileInputRef.current.value = '';
    } catch (error) {
      setMessage('Error uploading file');
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <h3>Upload CSV</h3>
      <form onSubmit={handleSubmit} onDragEnter={handleDrag}>
        <div
          style={{
            border: `2px dashed ${dragActive ? '#4CAF50' : '#ccc'}`,
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: dragActive ? '#e8f5e9' : '#fafafa',
            cursor: 'pointer',
            margin: '20px auto',
            maxWidth: '400px',
          }}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <p>{file ? file.name : 'Drag & drop a CSV file here or click to select'}</p>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Upload
        </button>
      </form>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default Upload;