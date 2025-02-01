import React from 'react';

const Settings = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved!');
  };

  return (
    <div>
      <h2>Settings</h2>
      <form onSubmit={handleSubmit}>
        <label>Select Data to Monitor:</label>
        <select multiple>
          <option>Email Addresses</option>
          <option>Credit Card Numbers</option>
          <option>Social Security Numbers</option>
        </select>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
