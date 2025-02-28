import React, { useState } from 'react';
import axios from 'axios';
import './DocumentScanner.css';

function DocumentScanner({ isDarkMode }) {
  const [document, setDocument] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [processedFiles, setProcessedFiles] = useState(null);

  const scanDocument = async () => {
    if (!document.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/check-text', { 
        text: document 
      });
      setResults(response.data.matches);
    } catch (error) {
      alert('Error scanning document');
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (file && allowedTypes.includes(file.type)) {
      setFileName(file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      setIsLoading(true);
      try {
        const response = await axios.post('http://localhost:5000/api/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setDocument(response.data.text || '');
        setResults(response.data.matches);
        setProcessedFiles({
          highlighted: response.data.highlightedFile,
          masked: response.data.maskedFile
        });
      } catch (error) {
        alert(error.response?.data?.error || 'Error processing file');
        console.error('Error:', error);
      }
      setIsLoading(false);
    } else {
      alert('Please upload a supported file type (PDF, DOCX, XLSX, or TXT)');
    }
  };

  const handleDownload = (filename) => {
    window.location.href = `http://localhost:5000/api/download/${filename}`;
  };

  const handleView = (filename) => {
    window.open(`http://localhost:5000/api/view/${filename}`, '_blank');
  };

  const highlightMatches = (content, matches) => {
    let highlightedContent = content;
    const sortedMatches = [...matches].sort((a, b) => b.length - a.length); // Sort by length to handle overlapping matches
    
    sortedMatches.forEach(match => {
      const regex = new RegExp(`(${match})`, 'gi');
      highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>');
    });
    
    return <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
  };

  return (
    <div className={`scanner-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="scanner-card">
        <h2 className="scanner-title">Document Scanner</h2>
        
        <div className="upload-section">
          <div className="file-upload-wrapper">
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.txt"
              onChange={handleFileUpload}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              {fileName || 'Choose file (PDF, DOCX, XLSX, or TXT)'}
            </label>
          </div>
        </div>

        <div className="text-section">
          <textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Paste your text here..."
            className="scanner-textarea"
          />
          <button 
            onClick={scanDocument} 
            className="scan-button"
            disabled={isLoading}
          >
            {isLoading ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        <div className="results-section">
          <h3 className="results-title">Results</h3>
          {results.length > 0 ? (
            <div className="results-container">
              {results.map((result, index) => (
                <div key={index} className="result-card">
                  <h4 className="pattern-name">{result.patternName}</h4>
                  {result.matches.map((match, matchIndex) => (
                    <div key={matchIndex} className="match-item">
                      <div className="match-line">Line {match.line}</div>
                      <div className="match-content">
                        {highlightMatches(match.content, match.matches)}
                      </div>
                      <div className="match-found">
                        <strong>Matched words:</strong> {match.matches.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No matches found.</p>
          )}

          {processedFiles && (
            <div className="processed-files">
              <h4>Processed Documents</h4>
              <div className="file-actions">
                <div className="file-action-group">
                  <h5>Highlighted Version</h5>
                  <button onClick={() => handleView(processedFiles.highlighted)}>
                    View
                  </button>
                  <button onClick={() => handleDownload(processedFiles.highlighted)}>
                    Download
                  </button>
                </div>
                <div className="file-action-group">
                  <h5>Masked Version</h5>
                  <button onClick={() => handleView(processedFiles.masked)}>
                    View
                  </button>
                  <button onClick={() => handleDownload(processedFiles.masked)}>
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentScanner;