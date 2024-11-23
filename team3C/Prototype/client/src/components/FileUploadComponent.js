import React, { useState } from 'react';
import axios from 'axios';
import './FileUploadComponent.css'; // Import the CSS file

const FileUploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [sensitiveData, setSensitiveData] = useState([]); // State to store sensitive words

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
      const response = await axios.post('http://localhost:8888/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Server Response:', response.data);

      // Update upload status and sensitive data
      setUploadStatus(`Upload successful: ${response.data.message}`);
      setSensitiveData(response.data.matchedWords); // Store matched words in state
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
      setSensitiveData([]); // Clear sensitive data in case of error
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

      {sensitiveData.length > 0 && (
        <div className="sensitive-data-container">
          <h3>Sensitive Data:</h3>
          <ul>
            {sensitiveData.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
