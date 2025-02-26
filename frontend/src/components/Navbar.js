
import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavbarStyles.css";

const Navbar = ({ onLogout, onHamburgerClick, isAuthenticated }) => {
  return (
    <nav className="navbar">
      <div className="left-section">
        {isAuthenticated && (
          <button className="hamburger-icon" onClick={onHamburgerClick}>
            ☰
          </button>
        )}
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/employees">Employees</Link>
          </li>

        </ul>
      </div>
      <div className="right-section">
        {isAuthenticated && (
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
