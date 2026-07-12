const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

const {
  createRequest,
  getMyRequests,
  getAllRequestsForAdmin,
  adminReviewRequest,
} = require("../controllers/leaveController");

// Employee: view own requests (more specific, put first)
router.get(
  "/requests/me",
  authMiddleware,
  roleMiddleware("employee"),
  getMyRequests
);

// Employee: submit request
router.post(
  "/requests",
  authMiddleware,
  roleMiddleware("employee"),
  createRequest
);

// Admin: view all requests
router.get(
  "/requests",
  authMiddleware,
  roleMiddleware("admin"),
  getAllRequestsForAdmin
);

// Admin: approve/reject
router.patch(
  "/requests/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminReviewRequest
);

module.exports = router;
