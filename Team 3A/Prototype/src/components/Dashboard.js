import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({ files: 0, incidents: 0, alerts: 0 });

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setStats({ files: 120, incidents: 30, alerts: 5 });
    }, 1000);
  }, []);

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <p>Monitor flagged data, activity trends, and system performance.</p>
      <ul>
        <li>Files Analyzed: <strong>{stats.files}</strong></li>
        <li>Flagged Incidents: <strong>{stats.incidents}</strong></li>
        <li>Real-Time Alerts: <strong>{stats.alerts}</strong></li>
      </ul>
    </div>
  );
};

export default Dashboard;
