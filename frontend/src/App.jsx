// Import the useState hook from React.
import { useState } from "react";

// Import the Login component.
import Login from "./components/Login";

// Import the OTP verification component.
import OTPVerification from "./components/OTPVerification";

// Import the success component.
import Success from "./components/Success";

// Import the CSS file.
import "./App.css";

// Create the main App component.
function App() {

    // Store the current screen.
    const [screen, setScreen] = useState("login");

    // Store the user's email.
    const [email, setEmail] = useState("");

    // Store the OTP received from backend.
    const [otp, setOtp] = useState("");

    // Called when OTP is successfully sent.
    const handleOTPSent = (userEmail, userOtp) => {

        // Store the email.
        setEmail(userEmail);

        // Store the OTP.
        setOtp(userOtp);

        // Move to the OTP screen.
        setScreen("otp");
    };

    // Called when OTP verification succeeds.
    const handleSuccess = () => {

        // Move to the success screen.
        setScreen("success");
    };

    // Go back to the login screen.
    const handleBack = () => {

        // Clear the email.
        setEmail("");

        // Return to login screen.
        setScreen("login");
    };

    // Decide which component to display.
    if (screen === "otp") {

        return (
            <OTPVerification
                email={email}
                onSuccess={handleSuccess}
                onBack={handleBack}
            />
        );
    }

    // Display the success screen.
    if (screen === "success") {

        return <Success />;
    }

    // Display the login screen by default.
    return (
        <Login
            onOTPSent={handleOTPSent}
        />
    );
}

// Export the App component.
export default App;