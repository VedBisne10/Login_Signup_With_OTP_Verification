// ─────────────────────────────────────────────
// authController.js
// Contains the logic for two actions:
//   1. sendOTP  — generates a 6-digit OTP and saves it to the database.
//   2. verifyOTP — checks the OTP the user submitted and logs them in.
// ─────────────────────────────────────────────

// Import the OTP model to read/write OTP records in MongoDB.
const OTP = require("../models/OTP");

// Import the User model to find or create a user after OTP is verified.
const User = require("../models/User");

// ─────────────────────────────────────────────
// Helper: generateOTP
// Creates a random 6-digit number and returns it as a string.
// Example output: "482910"
// ─────────────────────────────────────────────
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────────
// Handler: sendOTP
// Called when the user submits their email on the login screen.
// Steps:
//   1. Validate that an email was provided.
//   2. Generate a 6-digit OTP.
//   3. Delete any existing OTP for this email (so only one is active at a time).
//   4. Save the new OTP to the database with a 50-minute expiry.
//   5. Return the OTP in the response (since there's no email service yet).
// ─────────────────────────────────────────────
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Reject the request if no email was provided.
        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        // Normalize the email: lowercase and strip whitespace.
        // This ensures "User@Email.COM" and "user@email.com" are treated the same.
        const normalizedEmail = email.toLowerCase().trim();

        // Generate a fresh 6-digit OTP.
        const otp = generateOTP();

        // Calculate the expiry time: 5 minutes from right now.
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Remove any previous OTP for this email so old codes can't be reused.
        await OTP.deleteMany({ email: normalizedEmail });

        // Save the new OTP to the database.
        await OTP.create({
            email: normalizedEmail,
            otp: otp,
            expiresAt: expiresAt
        });

        // Build the payload EmailJS expects.
        // service_id, template_id, and user_id come from the .env file.
        // template_params must match the variable names in your EmailJS template.
        const emailData = {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: {
                email: normalizedEmail,
                otp: otp
            }
        };

        // Send the OTP email via the EmailJS REST API.
        const emailResponse = await fetch(
            "https://api.emailjs.com/api/v1.0/email/send",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailData)
            }
        );

        // If EmailJS rejected the request, roll back the OTP and return an error.
        if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error("EmailJS error:", errorText);

            // Delete the saved OTP since the email was never delivered.
            await OTP.deleteMany({ email: normalizedEmail });

            return res.status(500).json({
                message: "Failed to send OTP email."
            });
        }

        // Email sent successfully — tell the frontend to move to the OTP screen.
        // Do NOT include the OTP in this response; the user should read it from email.
        res.status(200).json({
            message: "OTP sent successfully."
        });
    } catch (error) {
        console.error("Send OTP error:", error.message);
        res.status(500).json({
            message: "Failed to send OTP.",
            error: error.message
        });
    }
};

// ─────────────────────────────────────────────
// Handler: verifyOTP
// Called when the user submits the OTP they received.
// Steps:
//   1. Validate that both email and OTP were provided.
//   2. Look up the OTP record in the database.
//   3. Check if the OTP has expired.
//   4. Check if the OTP matches.
//   5. Find or create a User for this email, mark them as verified.
//   6. Delete the used OTP so it can't be reused.
//   7. Return success with the user's details.
// ─────────────────────────────────────────────
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Reject the request if email or OTP is missing.
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required."
            });
        }

        // Normalize the email the same way we did in sendOTP.
        const normalizedEmail = email.toLowerCase().trim();

        // Look for an OTP record matching this email.
        const otpRecord = await OTP.findOne({ email: normalizedEmail });

        // If nothing was found, the user hasn't requested an OTP yet.
        if (!otpRecord) {
            return res.status(400).json({
                message: "OTP not found. Please request a new OTP."
            });
        }

        // Check if the OTP has passed its expiry time.
        if (new Date() > otpRecord.expiresAt) {
            // Delete the expired record so it doesn't clutter the database.
            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Check if the OTP the user entered matches the one we stored.
        if (otp !== otpRecord.otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // OTP is correct — find the user in the database or create them if first time.
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // First time this email has verified — create a new user record.
            user = await User.create({
                email: normalizedEmail,
                verified: true
            });
        } else {
            // User already exists — just mark them as verified and save.
            user.verified = true;
            await user.save();
        }

        // Delete the OTP now that it has been used successfully.
        await OTP.deleteOne({ _id: otpRecord._id });

        // Return success along with the user's basic details.
        res.status(200).json({
            message: "OTP Verified Successfully.",
            loginSuccessful: true,
            user: {
                id: user._id,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        // Something unexpected went wrong — return a 500 error.
        res.status(500).json({
            message: "Failed to verify OTP.",
            error: error.message
        });
    }
};

// Export both handlers so authRoutes.js can use them.
module.exports = {
    sendOTP,
    verifyOTP
};
