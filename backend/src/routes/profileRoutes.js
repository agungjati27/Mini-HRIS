const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getProfile, updateProfile } = require("../controllers/profileController");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, upload.single("avatar"), updateProfile);

module.exports = router;
