import React, { useState, useEffect } from "react";
import MenuBar from "./components/MenuBar";
import PatternForm from "./components/PatternForm";
import PatternList from "./components/PatternList";
import DocumentScanner from "./components/DocumentScanner";
import "./App.css";

function App() {
  const [activeView, setActiveView] = useState('fileUpload');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleFileUploadClick = () => {
    setActiveView('fileUpload');
  };

  const handleNewPatternClick = () => {
    setActiveView('newPattern');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      <MenuBar 
        onFileUploadClick={handleFileUploadClick}
        onNewPatternClick={handleNewPatternClick}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="main-content">
        <div className="content-wrapper">
          {activeView === 'fileUpload' ? (
            <DocumentScanner isDarkMode={isDarkMode} />
          ) : (
            <div className="pattern-management">
              <PatternForm isDarkMode={isDarkMode} />
              <PatternList isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
