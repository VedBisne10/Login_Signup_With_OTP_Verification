// ─────────────────────────────────────────────
// models/User.js
// Defines the shape of a User document in MongoDB.
// Each user has an email address and a flag that
// tracks whether they have verified that email.
// ─────────────────────────────────────────────

// Mongoose lets us define schemas and interact with MongoDB.
const mongoose = require("mongoose");

// A schema describes what fields a document must/can have
// and what rules apply to each field.
const userSchema = new mongoose.Schema(
    {
        // The user's email address.
        // Must be provided, must be unique across all users,
        // and is automatically lowercased and trimmed before saving.
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Whether the user has successfully verified their email via OTP.
        // Defaults to false when a new user is created.
        verified: {
            type: Boolean,
            default: false
        }
    },

    {
        // Automatically add "createdAt" and "updatedAt" fields to every document.
        timestamps: true
    }
);

// Create the User model from the schema.
// Mongoose will store documents in a collection called "users".
const User = mongoose.model("User", userSchema);

// Export the model so other files can use it to query the users collection.
module.exports = User;
