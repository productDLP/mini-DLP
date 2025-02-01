import React, { useState } from 'react';

const FileUpload = () => {
  const [result, setResult] = useState('');

  const handleUpload = (e) => {
    e.preventDefault();
    setResult("Uploaded Successfully!");
  };

  return (
    <div>
      <h2>File Upload</h2>
      <form onSubmit={handleUpload}>
        <label>Select File:</label>
        <input type="file" />
        <label>Enter Text:</label>
        <textarea rows="4" placeholder="Type or paste your text here..." />
        <button type="submit">Upload</button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
};

export default FileUpload;
