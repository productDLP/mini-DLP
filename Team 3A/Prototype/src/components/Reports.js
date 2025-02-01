import React from 'react';

const Reports = () => {
  const handleDownload = (e) => {
    e.preventDefault();
    alert('Report downloaded!');
  };

  return (
    <div>
      <h2>Reports</h2>
      <form onSubmit={handleDownload}>
        <label>Select Data Type:</label>
        <select>
          <option value="emails">Emails</option>
          <option value="creditCards">Credit Cards</option>
          <option value="ssn">Social Security Numbers</option>
        </select>
        <button type="submit">Download Report</button>
      </form>
    </div>
  );
};

export default Reports;
