require("dotenv").config({ path: "./.env" });
const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors({ origin: "*", credentials: true }));

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";

let users = [
  { id: "1", username: "admin", password: bcrypt.hashSync("admin123", 8), role: "ADMIN" },
  { id: "2", username: "employee", password: bcrypt.hashSync("employee123", 8), role: "EMPLOYEE" },
];

const typeDefs = gql`
  type Employee {
    id: ID!
    name: String!
    age: Int!
    class: String!
    subjects: [String]
    attendance: Int
    flagged: Boolean
  }

  type User {
    id: ID!
    username: String!
    role: String!
    token: String
  }

  type Query {
    employees(limit: Int, offset: Int, sortBy: String, sortOrder: String): [Employee]
    employee(id: ID!): Employee
  }

  type Mutation {
    login(username: String!, password: String!): User
    addEmployee(name: String!, age: Int!, class: String!, subjects: [String], attendance: Int): Employee
    updateEmployee(id: ID!, name: String, age: Int, class: String, subjects: [String], attendance: Int): Employee
    deleteEmployee(id: ID!): Employee
    flagEmployee(id: ID!): Employee
  }
`;

let inMemoryEmployees = [
  { id: "1", name: "Ravi", age: 28, class: "A", subjects: ["Math", "Physics"], attendance: 92, flagged: false },
  { id: "2", name: "Kiran", age: 25, class: "B", subjects: ["Biology", "Chemistry"], attendance: 88, flagged: false },
  { id: "3", name: "Suresh", age: 30, class: "C", subjects: ["English", "History"], attendance: 95, flagged: false },
  { id: "4", name: "Anjali", age: 26, class: "A", subjects: ["Computer Science", "Mathematics"], attendance: 90, flagged: false },
  { id: "5", name: "Vijay", age: 32, class: "B", subjects: ["Economics", "Statistics"], attendance: 90, flagged: false },
  { id: "6", name: "Sunita", age: 29, class: "C", subjects: ["History", "Geography"], attendance: 88, flagged: false },
  { id: "7", name: "Ramesh", age: 31, class: "A", subjects: ["Mechanical", "Physics"], attendance: 93, flagged: false },
  { id: "8", name: "Priya", age: 27, class: "B", subjects: ["Biology", "Chemistry"], attendance: 91, flagged: false },
  { id: "9", name: "Srinivas", age: 34, class: "C", subjects: ["English", "Literature"], attendance: 87, flagged: false },
  { id: "10", name: "Lakshmi", age: 30, class: "A", subjects: ["Art", "Design"], attendance: 94, flagged: false },
];

const resolvers = {
  Query: {
    employees: (_, { limit = 0, offset = 0, sortBy = "none", sortOrder = "asc" }) => {
      let resultEmployees = [...inMemoryEmployees];
      if (sortBy !== "none" && inMemoryEmployees[0][sortBy] !== undefined) {
        resultEmployees.sort((a, b) =>
          sortOrder === "asc" ? (a[sortBy] > b[sortBy] ? 1 : -1) : (a[sortBy] < b[sortBy] ? 1 : -1)
        );
      }
      if (limit === 0) {
        return resultEmployees;
      }
      return resultEmployees.slice(offset, offset + limit);
    },
    
    
    employee: (_, { id }) => inMemoryEmployees.find((emp) => emp.id === id),
  },
  Mutation: {
    login: (_, { username, password }) => {
      const user = users.find((u) => u.username === username);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error("Invalid credentials");
      }
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
      return { id: user.id, username: user.username, role: user.role, token };
    },
    addEmployee: (_, { name, age, class: className, subjects, attendance }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const newEmployee = { id: String(inMemoryEmployees.length + 1), name, age, class: className, subjects, attendance, flagged: false };
      inMemoryEmployees.push(newEmployee);
      return newEmployee;
    },
    updateEmployee: (_, { id, name, age, class: className, subjects, attendance }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const employee = inMemoryEmployees.find((emp) => emp.id === id);
      if (!employee) return null;
      if (name) employee.name = name;
      if (age) employee.age = age;
      if (className) employee.class = className;
      if (subjects) employee.subjects = subjects;
      if (attendance) employee.attendance = attendance;
      return employee;
    },
    deleteEmployee: (_, { id }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const index = inMemoryEmployees.findIndex((emp) => emp.id === id);
      if (index === -1) return null;
      return inMemoryEmployees.splice(index, 1)[0];
    },
    flagEmployee: (_, { id }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const employee = inMemoryEmployees.find((emp) => emp.id === id);
      if (!employee) return null;
      employee.flagged = !employee.flagged;
      return employee;
    },
    
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return {};
    }
    try {
      const tokenValue = authHeader.replace("Bearer ", "").trim();
      const decodedUser = jwt.verify(tokenValue, SECRET_KEY);
      return { user: decodedUser };
    } catch (error) {
      console.log("Authentication failed:", error.message);
      return {};
    }
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
  app.listen(4000, () => {
    console.log("Server running at http://localhost:4000/graphql");
  });
}

startServer().catch((err) => console.error("Server Error:", err));
