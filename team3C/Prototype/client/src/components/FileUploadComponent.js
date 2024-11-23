import React, { useState } from 'react';
import axios from 'axios';
import './FileUploadComponent.css'; // Import the CSS file

const FileUploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadStatus('Uploading...');
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(`Upload successful: ${response.data.message}`);
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>File Upload Component</h2>
      <input type="file" onChange={handleFileChange} className="file-upload-input" />
      <button onClick={handleFileUpload} className="file-upload-button">
        Upload File
      </button>
      {uploadStatus && <p className="file-upload-status">{uploadStatus}</p>}
    </div>
  );
};

export default FileUploadComponent;
