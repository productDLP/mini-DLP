// PatternList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatternList.css';

function PatternList({ isDarkMode }) {
  const [patterns, setPatterns] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patterns');
      const patternsData = Array.isArray(response.data) ? response.data : [];
      setPatterns(patternsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching patterns:', err);
      setError('Error loading patterns');
      setPatterns([]);
    }
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(`http://localhost:5000/api/patterns/${index}`);
      fetchPatterns();
    } catch (err) {
      alert('Error deleting pattern');
    }
  };

  if (error) {
    return (
      <div className={`pattern-list-container ${isDarkMode ? 'dark' : ''}`}>
        <h2 className="card-title">Custom Patterns</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className={`pattern-list-container ${isDarkMode ? 'dark' : ''}`}>
      <h2 className="card-title">Custom Patterns</h2>
      <div className="pattern-list">
        {patterns.length > 0 ? (
          patterns.map((pattern, index) => (
            <div key={index} className="pattern-item">
              <div className="pattern-info">
                <h3>{pattern.name}</h3>
                <p className="pattern-text">{pattern.pattern}</p>
              </div>
              <button 
                onClick={() => handleDelete(index)} 
                className="btn btn-danger"
                title="Delete pattern"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))
        ) : (
          <p className="no-patterns">No custom patterns added yet.</p>
        )}
      </div>
    </div>
  );
}

export default PatternList;