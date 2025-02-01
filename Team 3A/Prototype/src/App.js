import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import Monitoring from './components/Monitoring';
import Settings from './components/Settings';
import Reports from './components/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
