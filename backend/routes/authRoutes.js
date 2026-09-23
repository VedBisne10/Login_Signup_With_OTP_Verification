// ─────────────────────────────────────────────
// authRoutes.js
// Defines the URL endpoints for authentication.
// Any request to /api/auth/... lands here first,
// then gets handed off to the right controller function.
// ─────────────────────────────────────────────

// Express is needed to create a router.
const express = require("express");

// A Router is a mini-app that handles a group of related routes.
const router = express.Router();

// Import the two handler functions from the controller.
const { sendOTP, verifyOTP } = require("../controllers/authController");

// POST /api/auth/send-otp
// The user submits their email → we generate and return an OTP.
router.post("/send-otp", sendOTP);

// POST /api/auth/verify-otp
// The user submits their email + OTP → we verify it and log them in.
router.post("/verify-otp", verifyOTP);

// Export the router so server.js can mount it.
module.exports = router;
