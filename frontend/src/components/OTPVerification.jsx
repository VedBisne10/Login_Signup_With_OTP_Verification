// ─────────────────────────────────────────────
// OTPVerification.jsx
// The second screen — shown after the user submits their email.
// It displays the email the OTP was sent to, shows the OTP
// (for testing purposes), and provides an input for the user
// to type the OTP and verify it.
// ─────────────────────────────────────────────

// useState lets us track the OTP input, loading state, and errors.
import { useState } from "react";

// Props received from App.jsx:
//   email     — the email address the OTP was sent to (for display)
//   otp       — the OTP returned by the backend (shown on screen for testing)
//   onSuccess — called when verification succeeds, triggers the success screen
//   onBack    — called when the user wants to go back and change their email
function OTPVerification({ email, otp, onSuccess, onBack }) {

    // Holds whatever the user types into the OTP input field.
    const [enteredOtp, setEnteredOtp] = useState("");

    // True while we're waiting for the backend to respond.
    const [loading, setLoading] = useState(false);

    // Holds an error message if verification fails.
    const [error, setError] = useState("");

    // Runs when the user clicks "Verify OTP".
    const handleVerifyOTP = async (event) => {

        // Stop the browser from refreshing the page.
        event.preventDefault();

        // Clear any previous error.
        setError("");

        // Don't proceed if the OTP field is empty.
        if (!enteredOtp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        // Show the loading state while the request is in flight.
        setLoading(true);

        try {
            // Send the email and OTP to the backend for verification.
            const response = await fetch(
                "http://localhost:5000/api/auth/verify-otp",
                {
                    method: "POST",
                    // Tell the backend we're sending JSON.
                    headers: { "Content-Type": "application/json" },
                    // Send both the email and the OTP the user typed.
                    body: JSON.stringify({
                        email: email,
                        otp: enteredOtp
                    })
                }
            );

            // Parse the JSON response.
            const data = await response.json();

            // If verification failed, show the error message from the backend.
            if (!response.ok) {
                setError(data.message || "OTP verification failed.");
                return;
            }

            // OTP verified — tell App.jsx to show the success screen.
            onSuccess();

        } catch (error) {
            // This runs if the server is down or there's no internet.
            setError("Unable to connect to the server.");

        } finally {
            // Always stop loading when done.
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h1>Verify OTP</h1>

                {/* Show the email address the OTP was sent to */}
                <p>OTP sent to:</p>
                <strong>{email}</strong>

                {/* Show the OTP on screen (only useful during development/testing).
                    In production this would be sent via email instead. */}
                {otp && (
                    <p className="otp-display">
                        Your OTP: <strong>{otp}</strong>
                    </p>
                )}

                <form onSubmit={handleVerifyOTP}>

                    <label>Enter OTP</label>

                    {/* Controlled input — limited to 6 characters */}
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={enteredOtp}
                        maxLength="6"
                        onChange={(event) => setEnteredOtp(event.target.value)}
                    />

                    {/* Only show the error paragraph if there's an error */}
                    {error && <p className="error">{error}</p>}

                    {/* Button text changes while waiting for the backend */}
                    <button type="submit" disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                </form>

                {/* Lets the user go back and enter a different email */}
                <button className="secondary-button" onClick={onBack}>
                    Change Email
                </button>

            </div>
        </div>
    );
}

export default OTPVerification;
