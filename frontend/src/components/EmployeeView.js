import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import "../styles/EmployeeView.css";

const EMPLOYEES_QUERY = gql`
  query EmployeesQuery($limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
    employees(limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
      id
      name
      age
      class
      subjects
      attendance
      flagged
    }
  }
`;

const ADD_EMPLOYEE_MUTATION = gql`
  mutation addEmployee($name: String!, $age: Int!, $class: String!, $subjects: [String], $attendance: Int) {
    addEmployee(name: $name, age: $age, class: $class, subjects: $subjects, attendance: $attendance) {
      id
      name
    }
  }
`;

const FLAG_EMPLOYEE_MUTATION = gql`
  mutation flagEmployee($id: ID!) {
    flagEmployee(id: $id) {
      id
      flagged
    }
  }
`;

const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation updateEmployee(
    $id: ID!
    $name: String
    $age: Int
    $class: String
    $subjects: [String]
    $attendance: Int
  ) {
    updateEmployee(id: $id, name: $name, age: $age, class: $class, subjects: $subjects, attendance: $attendance) {
      id
      name
      age
      class
      subjects
      attendance
      flagged
    }
  }
`;

const DELETE_EMPLOYEE_MUTATION = gql`
  mutation deleteEmployee($id: ID!) {
    deleteEmployee(id: $id) {
      id
      name
    }
  }
`;

const EmployeeView = () => {
  // Default limit is "0" to show all employees; default sortBy is "none" (i.e. no sorting)
  const [limit, setLimit] = useState("0");
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState("none");
  const [sortOrder, setSortOrder] = useState("asc");

  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    age: "",
    class: "",
    subjects: "",
    attendance: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "EMPLOYEE";
    setUserRole(role);
  }, []);

  const { loading, error, data, refetch } = useQuery(EMPLOYEES_QUERY, {
    variables: { 
      limit: Number(limit), 
      offset, 
      sortBy, 
      sortOrder 
    },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    setOffset(0);
    refetch();
  }, [limit, sortBy, sortOrder, refetch]);

  const [addEmployee] = useMutation(ADD_EMPLOYEE_MUTATION);
  const [flagEmployee] = useMutation(FLAG_EMPLOYEE_MUTATION);
  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE_MUTATION);
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE_MUTATION);

  const setViewModePersisted = (mode) => {
    localStorage.setItem("viewMode", mode);
    setViewMode(mode);
  };

  const handleFlag = async (id) => {
    try {
      await flagEmployee({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error flagging employee:", err);
      alert(`Error flagging employee: ${err.message}`);
    }
  };

  const handleEdit = async (emp) => {
    if (userRole !== "ADMIN") {
      alert("You are not authorized to edit employees.");
      return;
    }
    const newName = prompt("Enter new name:", emp.name);
    if (newName === null) return;
    const newAge = prompt("Enter new age:", emp.age);
    if (newAge === null) return;
    const newClass = prompt("Enter new class:", emp.class);
    if (newClass === null) return;
    const newSubjects = prompt("Enter new subjects (comma-separated):", emp.subjects.join(", "));
    if (newSubjects === null) return;
    const newAttendance = prompt("Enter new attendance:", emp.attendance);
    if (newAttendance === null) return;
    try {
      await updateEmployee({
        variables: {
          id: emp.id,
          name: newName,
          age: parseInt(newAge),
          class: newClass,
          subjects: newSubjects.split(",").map(s => s.trim()).filter(s => s !== ""),
          attendance: parseInt(newAttendance),
        },
      });
      refetch();
    } catch (err) {
      alert(`Error updating employee: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (userRole !== "ADMIN") {
      alert("You are not authorized to delete employees.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployee({ variables: { id } });
      refetch();
    } catch (err) {
      alert(`Error deleting employee: ${err.message}`);
    }
  };

  const handleNewEmployeeChange = (e) => {
    setNewEmployee(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddEmployee = async () => {
    if (userRole !== "ADMIN") {
      alert("You are not authorized to add employees.");
      return;
    }
    try {
      await addEmployee({
        variables: {
          ...newEmployee,
          age: parseInt(newEmployee.age),
          attendance: parseInt(newEmployee.attendance),
          subjects: newEmployee.subjects.split(",").map(s => s.trim()).filter(s => s !== ""),
        },
      });
      setNewEmployee({
        name: "",
        age: "",
        class: "",
        subjects: "",
        attendance: "",
      });
      refetch();
    } catch (err) {
      alert(`Error adding employee: ${err.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading employees: {error.message}</p>;

  return (
    <div className="employee-view-container">
      <div className="pagination-sorting-controls">
        <label>
          Limit:{" "}
          <input
            type="number"
            min="0"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </label>
        <label>
          Sort By:{" "}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="none">None</option>
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="class">Class</option>
            <option value="attendance">Attendance</option>
          </select>
        </label>
        <label>
          Sort Order:{" "}
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>
      <div className="view-switch">
        <button onClick={() => setViewModePersisted("grid")}>Grid View</button>
        <button onClick={() => setViewModePersisted("tile")}>Tile View</button>
      </div>
      {userRole === "ADMIN" && (
        <div className="add-employee-container">
          <input type="text" name="name" placeholder="Name" value={newEmployee.name} onChange={handleNewEmployeeChange} />
          <input type="number" name="age" placeholder="Age" value={newEmployee.age} onChange={handleNewEmployeeChange} />
          <input type="text" name="class" placeholder="Class" value={newEmployee.class} onChange={handleNewEmployeeChange} />
          <input type="text" name="subjects" placeholder="Subjects (comma-separated)" value={newEmployee.subjects} onChange={handleNewEmployeeChange} />
          <input type="number" name="attendance" placeholder="Attendance" value={newEmployee.attendance} onChange={handleNewEmployeeChange} />
          <button onClick={handleAddEmployee}>Add Employee</button>
        </div>
      )}
      {viewMode === "grid" && (
        <table className="employee-grid">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Class</th>
              <th>Subjects</th>
              <th>Attendance</th>
              <th>Flagged</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.age}</td>
                <td>{emp.class}</td>
                <td>{emp.subjects.join(", ")}</td>
                <td>{emp.attendance}%</td>
                <td>{emp.flagged ? "Yes" : "No"}</td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn" onClick={() => setSelectedEmployee(emp)}>View</button>
                    <button className="edit-btn" onClick={() => handleEdit(emp)}>Edit</button>
                    <button className="flag-btn" onClick={() => handleFlag(emp.id)}>Flag</button>
                    <button className="delete-btn" onClick={() => handleDelete(emp.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {viewMode === "tile" && (
        <div className="employee-tiles">
          {data.employees.map(emp => (
            <div className="tile" key={emp.id}>
              <h3>{emp.name}</h3>
              <p>Class: {emp.class}</p>
              <p>Attendance: {emp.attendance}%</p>
              <p>Flagged: {emp.flagged ? "Yes" : "No"}</p>
              <div className="tile-actions">
                <button className="view-btn" onClick={() => setSelectedEmployee(emp)}>View</button>
                <button className="edit-btn" onClick={() => handleEdit(emp)}>Edit</button>
                <button className="flag-btn" onClick={() => handleFlag(emp.id)}>Flag</button>
                <button className="delete-btn" onClick={() => handleDelete(emp.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Employee Details</h2>
            <p><strong>ID:</strong> {selectedEmployee.id}</p>
            <p><strong>Name:</strong> {selectedEmployee.name}</p>
            <p><strong>Age:</strong> {selectedEmployee.age}</p>
            <p><strong>Class:</strong> {selectedEmployee.class}</p>
            <p><strong>Subjects:</strong> {selectedEmployee.subjects.join(", ")}</p>
            <p><strong>Attendance:</strong> {selectedEmployee.attendance}%</p>
            <p><strong>Flagged:</strong> {selectedEmployee.flagged ? "Yes" : "No"}</p>
            <button onClick={() => setSelectedEmployee(null)}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeView;
