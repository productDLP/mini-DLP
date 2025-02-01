import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => (
  <nav className="sidebar">
    <h2>DLP System</h2>
    <ul>
      <li><NavLink to="/" end>Dashboard</NavLink></li>
      <li><NavLink to="/upload">File Upload</NavLink></li>
      <li><NavLink to="/monitoring">Monitoring</NavLink></li>
      <li><NavLink to="/settings">Settings</NavLink></li>
      <li><NavLink to="/reports">Reports</NavLink></li>
    </ul>
  </nav>
);

export default Sidebar;
