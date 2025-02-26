
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HamburgerMenu from "./components/HamburgerMenu";
import EmployeeView from "./components/EmployeeView";
import Login from "./components/Login";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
  };

  const handleHamburgerClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      {isAuthenticated && (
        <>
          <Navbar 
            onLogout={handleLogout} 
            onHamburgerClick={handleHamburgerClick} 
            isAuthenticated={isAuthenticated} 
          />
          <HamburgerMenu isOpen={isSidebarOpen} />
        </>
      )}
      <div className={`main-content ${isAuthenticated ? "authenticated" : ""} ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Routes>
          {!isAuthenticated ? (
            <Route path="/*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          ) : (
            <>
              <Route path="/" element={<EmployeeView />} />
              <Route path="/employees" element={<EmployeeView />} />

            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default App;
