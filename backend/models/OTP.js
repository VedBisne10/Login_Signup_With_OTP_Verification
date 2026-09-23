// ─────────────────────────────────────────────
// models/OTP.js
// Defines the shape of an OTP document in MongoDB.
// When a user requests an OTP, we save a record here.
// Once the OTP is used or expires, the record is deleted.
// ─────────────────────────────────────────────

// Mongoose lets us define schemas and interact with MongoDB.
const mongoose = require("mongoose");

// A schema describes what fields a document must/can have
// and what rules apply to each field.
const otpSchema = new mongoose.Schema(
    {
        // The email address this OTP belongs to.
        // Unique ensures only one active OTP exists per email at a time.
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // The 6-digit OTP code itself, stored as a string.
        otp: {
            type: String,
            required: true
        },

        // The exact date and time when this OTP stops being valid.
        // Set to 50 minutes after creation in the controller.
        expiresAt: {
            type: Date,
            required: true
        }
    },

    {
        // Automatically add "createdAt" and "updatedAt" fields to every document.
        timestamps: true
    }
);

// Create the OTP model from the schema.
// Mongoose will store documents in a collection called "otps".
const OTP = mongoose.model("OTP", otpSchema);

// Export the model so the controller can read and write OTP records.
module.exports = OTP;
