import React, { useState } from 'react';
import axios from 'axios';
import './FileUploadComponent.css';

const FileUploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [sensitiveData, setSensitiveData] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
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

      setUploadStatus('Upload successful!');
      setSensitiveData(response.data.matchedPatterns);
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
      setSensitiveData([]);
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'PDF';
    if (['doc', 'docx'].includes(extension)) return 'Word Document';
    if (['xls', 'xlsx'].includes(extension)) return 'Excel Spreadsheet';
    return 'Unknown Type';
  };

  return (
    <div className="file-upload-container">
      <h2 className="upload-title">Upload Your File</h2>

      <div className="file-input-container">
        <input
          type="file"
          onChange={handleFileChange}
          className="file-upload-input"
        />
        <button
          onClick={handleFileUpload}
          className="file-upload-button"
        >
          Upload File
        </button>
      </div>

      {selectedFile && (
        <div className="file-details">
          <p><strong>File Name:</strong> {selectedFile.name}</p>
          <p><strong>File Type:</strong> {getFileType(selectedFile.name)}</p>
        </div>
      )}

      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}

      {sensitiveData.length > 0 && (
        <div className="sensitive-data-container">
          <h3 className="sensitive-data-title">Detected Sensitive Data:</h3>
          <ul className="sensitive-data-list">
            {sensitiveData.map((pattern, index) => (
              <li key={index} className="sensitive-data-item">
                <strong>{pattern.name}:</strong> {pattern.matches.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
