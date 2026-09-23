// ─────────────────────────────────────────────
// server.js
// The entry point of the backend.
// It sets up the Express app, connects to
// MongoDB, registers routes, and starts
// listening for incoming requests.
// ─────────────────────────────────────────────

// Load environment variables from the .env file
// so we can use things like PORT and MONGODB_URI
// without hardcoding them.
require("dotenv").config();

// Express is the framework we use to build the API.
const express = require("express");

// CORS lets the frontend (running on a different port)
// talk to this backend without being blocked by the browser.
const cors = require("cors");

// Mongoose is the library we use to talk to MongoDB.
const mongoose = require("mongoose");

// Import the User model so the /test-user route can create users.
const User = require("./models/User");

// Import the auth routes (send-otp and verify-otp endpoints).
const authRoutes = require("./routes/authRoutes");

// Create the Express application.
const app = express();

// Read the port number from the .env file.
const PORT = process.env.PORT;

// Allow requests from any origin (needed for the React frontend).
app.use(cors());

// Automatically parse incoming JSON request bodies,
// so we can access req.body in our route handlers.
app.use(express.json());

// Mount all auth-related routes under /api/auth.
// For example: POST /api/auth/send-otp
app.use("/api/auth", authRoutes);

// Connect to MongoDB using the connection string from .env.
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        // This runs if the connection was successful.
        console.log("MongoDB connected successfully.");
    })
    .catch((error) => {
        // This runs if the connection failed.
        console.error("MongoDB connection failed:", error.message);
    });

// A simple health-check route.
// Visit http://localhost:PORT/ to confirm the backend is running.
app.get("/", (req, res) => {
    res.json({ message: "Backend is working" });
});

// A test route for quickly creating a user in the database.
// Send a POST request with { "email": "test@example.com" } to use it.
app.post("/test-user", async (req, res) => {
    try {
        const { email } = req.body;

        // Make sure an email was provided.
        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        // Create a new user document in MongoDB.
        const user = await User.create({ email: email });

        // Return the created user as confirmation.
        res.status(201).json({
            message: "User created successfully.",
            user: user
        });
    } catch (error) {
        // Something went wrong — send back the error message.
        res.status(500).json({
            message: "Failed to create user.",
            error: error.message
        });
    }
});

// Start the server and begin listening for requests on the given port.
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
