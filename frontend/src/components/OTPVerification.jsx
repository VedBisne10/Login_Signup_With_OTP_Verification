// Import the useState hook.
import { useState } from "react";

// Create the OTP verification component.
function OTPVerification({ email, onSuccess, onBack }) {

    // Store the OTP entered by the user.
    const [otp, setOtp] = useState("");

    // Store the loading state.
    const [loading, setLoading] = useState(false);

    // Store error messages.
    const [error, setError] = useState("");

    // Handle OTP verification.
    const handleVerifyOTP = async (event) => {

        // Prevent page refresh.
        event.preventDefault();

        // Clear previous errors.
        setError("");

        // Check whether the OTP was entered.
        if (!otp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        // Start loading.
        setLoading(true);

        try {

            // Send the email and OTP to the backend.
            const response = await fetch(
                "http://localhost:5000/api/auth/verify-otp",
                {
                    // Use POST.
                    method: "POST",

                    // Tell the backend we're sending JSON.
                    headers: {
                        "Content-Type": "application/json"
                    },

                    // Send email and OTP.
                    body: JSON.stringify({
                        email: email,
                        otp: otp
                    })
                }
            );

            // Convert response to JSON.
            const data = await response.json();

            // Check whether verification failed.
            if (!response.ok) {
                setError(
                    data.message || "OTP verification failed."
                );
                return;
            }

            // Tell App.jsx that login was successful.
            onSuccess();

        } catch (error) {

            // Display network error.
            setError(
                "Unable to connect to the server."
            );

        } finally {

            // Stop loading.
            setLoading(false);
        }
    };

    // Display the OTP form.
    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Verify OTP</h1>

                <p>
                    OTP sent to:
                </p>

                <strong>
                    {email}
                </strong>

                <form onSubmit={handleVerifyOTP}>

                    <label>
                        Enter OTP
                    </label>

                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        maxLength="6"
                        onChange={(event) =>
                            setOtp(event.target.value)
                        }
                    />

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify OTP"
                        }
                    </button>

                </form>

                <button
                    className="secondary-button"
                    onClick={onBack}
                >
                    Change Email
                </button>

            </div>

        </div>
    );
}

// Export the component.
export default OTPVerification;