// ─────────────────────────────────────────────
// Login.jsx
// The first screen the user sees.
// It shows an email input field and a "Send OTP" button.
// When submitted, it calls the backend to generate an OTP
// and then notifies App.jsx to move to the next screen.
// ─────────────────────────────────────────────

// useState lets us track the email input, loading state, and errors.
import { useState } from "react";

// onOTPSent is a function passed in from App.jsx.
// We call it when the OTP has been successfully sent,
// passing along the email and the OTP from the backend response.
function Login({ onOTPSent }) {

    // Holds whatever the user has typed in the email field.
    const [email, setEmail] = useState("");

    // True while we're waiting for the backend to respond.
    // Used to disable the button so the user can't submit twice.
    const [loading, setLoading] = useState(false);

    // Holds an error message to show below the input if something goes wrong.
    const [error, setError] = useState("");

    // Runs when the user clicks "Send OTP".
    const handleSendOTP = async (event) => {

        // Stop the browser from refreshing the page on form submit.
        event.preventDefault();

        // Clear any error from a previous attempt.
        setError("");

        // Don't proceed if the email field is empty.
        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        // Show the loading state while the request is in flight.
        setLoading(true);

        try {
            // Send the email to the backend's send-otp endpoint.
            const response = await fetch(
                "http://localhost:5000/api/auth/send-otp",
                {
                    method: "POST",
                    // Tell the backend we're sending JSON.
                    headers: { "Content-Type": "application/json" },
                    // Convert the email object to a JSON string.
                    body: JSON.stringify({ email: email })
                }
            );

            // Parse the JSON response from the backend.
            const data = await response.json();

            // If the backend returned an error status, show the message.
            if (!response.ok) {
                setError(data.message || "Failed to send OTP.");
                return;
            }

            // Success — tell App.jsx the OTP was sent.
            // Pass both the email and the OTP so App.jsx can store them.
            onOTPSent(email, data.otp);

        } catch (error) {
            // This runs if the server is down or there's no internet.
            setError("Unable to connect to the server.");

        } finally {
            // Always stop loading, whether the request succeeded or failed.
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h1>Welcome</h1>
                <p>Enter your email to continue.</p>

                <form onSubmit={handleSendOTP}>

                    <label>Email</label>

                    {/* Controlled input — value comes from state, updates state on change */}
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    {/* Only show the error paragraph if there's an error to display */}
                    {error && <p className="error">{error}</p>}

                    {/* Button text changes to "Sending OTP..." while loading */}
                    <button type="submit" disabled={loading}>
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default Login;
