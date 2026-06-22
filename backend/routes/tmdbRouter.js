// FILE: backend/routes/tmdbRouter.js
const express = require("express");
const tmdbController = require("../controllers/tmdbController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/search", tmdbController.search);

module.exports = router;