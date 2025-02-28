import React, { useState } from 'react';
import axios from 'axios';
import './PatternForm.css';

function PatternForm() {
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/patterns', { name, pattern });
      alert('Pattern saved successfully!');
      setName('');
      setPattern('');
    } catch (error) {
      alert(error.response.data.error || 'Error saving pattern');
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Add New Pattern</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Pattern Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Regex Pattern:</label>
          <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Save Pattern</button>
      </form>
    </div>
  );
}

export default PatternForm;