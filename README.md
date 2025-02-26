# Emporium
Overview

This is a full-stack application demonstrating a simple employee management system using the following technologies:
• Frontend: React, Apollo Client, React Router
• Backend: Node.js, Express, Apollo Server (GraphQL) with in-memory data storage

Features

• JWT-based authentication with role-based access control (Admin vs. Employee)
• CRUD operations on employee records
• Grid and Tile views for displaying employee data
• Ability to flag employees
• Sorting and pagination of employee records

Quick Start

1. Install and Run the Backend:
   • From the project root, install dependencies: npm install
   • Start the backend server: npm start
   (The GraphQL server will be running at http://localhost:4000/graphql)

2. Install and Run the Frontend:
   • Navigate to the frontend folder: cd frontend
   • Install frontend dependencies: npm install
   • Start the React app: npm start
   (The React application will be accessible at http://localhost:3000)

Login Credentials

Admin User:
Username: admin
Password: admin123
(Admin has privileges to create, update, and delete employee records)

Employee User:
Username: employee
Password: employee123
(Employee has limited privileges such as viewing and flagging employees)

Testing the App

• Open http://localhost:3000 in your browser.
• Log in using the provided credentials.
• Explore the features, including switching between Grid and Tile views, adding new employees (Admin only), editing employee details (Admin only), and toggling the flagged status.
