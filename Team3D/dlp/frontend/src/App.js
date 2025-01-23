import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'
function App() {
  const [documents, setDocuments] = useState([]);
  const [rules, setRules] = useState(null);
  const [file, setFile] = useState(null);

  // Fetch documents
  const fetchDocuments = async () => {
    const res = await axios.post('http://localhost:5000/classify');
    setDocuments(res.data.documents);
  };

  // Fetch rules
  const fetchRules = async () => {
    const res = await axios.get('http://localhost:5000/rules');
    setRules(res.data);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload.');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDocuments();
    } catch (err) {
      alert(err.response.data.error || 'File upload failed');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchRules();
  }, []);

  return (
    <div>
      <h1>Data Loss Prevention</h1>

      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf"
        />
        <button type="submit">Upload Document</button>
      </form>

      <button onClick={fetchDocuments}>Classify Documents</button>
      <button onClick={fetchRules}>Check Rules</button>

      <h2>Documents</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc._id}>
            <strong>{doc.name}</strong>: {doc.content.substring(0, 100)}... -{' '}
            <em>{doc.classification}</em>
          </li>
        ))}
      </ul>

      <h2>Rule Validation</h2>
      {rules && (
        <div>
          <p>Rules Met: {rules.rulesMet}</p>
          <p>Rules Violated: {rules.rulesViolated}</p>
        </div>
      )}
    </div>
  );
}

export default App;
