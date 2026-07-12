const express = require("express");

const router = express.Router();

const {
  getProfile,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
} = require("../controllers/employeeController");

const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// Employee: profile
router.get("/profile", authMiddleware, getProfile);

// Admin: list employees
router.get(
  "/admin/employees",
  authMiddleware,
  roleMiddleware("admin"),
  getAllEmployees
);

// Admin: create employee
router.post(
  "/admin/employees",
  authMiddleware,
  roleMiddleware("admin"),
  createEmployee
);

// Admin: update employee
router.patch(
  "/admin/employees/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateEmployee
);

// Admin: delete employee
router.delete(
  "/admin/employees/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteEmployee
);

// Admin: update employee status
router.patch(
  "/admin/employees/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateEmployeeStatus
);

module.exports = router;
