// Import the useState hook from React.
import { useState } from "react";

// Create the Login component.
function Login({ onOTPSent }) {

    // Store the email entered by the user.
    const [email, setEmail] = useState("");

    // Store the loading state.
    const [loading, setLoading] = useState(false);

    // Store any error message.
    const [error, setError] = useState("");

    // Handle the Send OTP button.
    const handleSendOTP = async (event) => {

        // Prevent the browser from refreshing the page.
        event.preventDefault();

        // Remove any previous error.
        setError("");

        // Check whether the email field is empty.
        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        // Start the loading state.
        setLoading(true);

        try {

            // Send the email to our backend.
            const response = await fetch(
                "http://localhost:5000/api/auth/send-otp",
                {
                    // Use POST because we are sending data.
                    method: "POST",

                    // Tell the backend that we're sending JSON.
                    headers: {
                        "Content-Type": "application/json"
                    },

                    // Convert the email into JSON.
                    body: JSON.stringify({
                        email: email
                    })
                }
            );

            // Convert the backend response into JavaScript.
            const data = await response.json();

            // Check whether the request failed.
            if (!response.ok) {
                setError(data.message || "Failed to send OTP.");
                return;
            }

            // Tell App.jsx that OTP was successfully sent, pass the OTP too.
            onOTPSent(email, data.otp);

        } 
        catch (error) {

            // Display a network error.
            setError(
                "Unable to connect to the server."
            );

        } 
        finally {
            // Stop the loading state.
            setLoading(false);
        }
    };

    // Display the login form.
    return (
        <div className="auth-card">
            <h1>Welcome</h1>
            <p> Enter your email to continue. </p>
            <form onSubmit={handleSendOTP}>
                <label> Email </label>
                <input 
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange = {(event) =>
                        setEmail(event.target.value)
                    }
                />
                {error && (
                    <p className="error"> {error} </p>
                )}
                <button
                    type="submit"
                    disabled={loading}
                >
                {loading
                    ? "Sending OTP..."
                    : "Send OTP"
                }
                </button>
            </form>
        </div>
    );
}

// Export the Login component.
export default Login;