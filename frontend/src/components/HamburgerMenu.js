import React from "react";
import "../styles/HamburgerMenu.css";

const HamburgerMenu = ({ isOpen }) => {
  return (
    <nav className={`sidebar ${isOpen ? "open" : ""}`}>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/employees">Employees</a></li>
      </ul>
    </nav>
  );
};

export default HamburgerMenu;
