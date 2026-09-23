// ─────────────────────────────────────────────
// App.jsx
// The root component of the frontend.
// It decides which screen to show the user:
//   "login"   → the email input form
//   "otp"     → the OTP verification form
//   "success" → the success message after login
// It also holds shared state (email and OTP) that
// needs to be passed between the screens.
// ─────────────────────────────────────────────

// useState lets us track which screen is active and
// store the email and OTP across screen transitions.
import { useState } from "react";

// The three screens of the app.
import Login from "./components/Login";
import OTPVerification from "./components/OTPVerification";
import Success from "./components/Success";

// Global styles for the app.
import "./App.css";

function App() {

    // Tracks which screen is currently visible.
    // Starts on "login" when the page first loads.
    const [screen, setScreen] = useState("login");

    // Stores the email the user typed on the login screen.
    // Passed to OTPVerification so it can show "OTP sent to: ..."
    const [email, setEmail] = useState("");

    // Stores the OTP returned by the backend after calling send-otp.
    // Passed to OTPVerification so it can display the code to the user.
    const [otp, setOtp] = useState("");

    // Called by Login when the backend successfully generates an OTP.
    // Saves the email and OTP, then switches to the OTP screen.
    const handleOTPSent = (userEmail, userOtp) => {
        setEmail(userEmail);
        setOtp(userOtp);
        setScreen("otp");
    };

    // Called by OTPVerification when the backend confirms the OTP is correct.
    // Switches to the success screen.
    const handleSuccess = () => {
        setScreen("success");
    };

    // Called by OTPVerification when the user clicks "Change Email".
    // Clears stored data and goes back to the login screen.
    const handleBack = () => {
        setEmail("");
        setOtp("");
        setScreen("login");
    };

    // Show the OTP verification screen if we're in the "otp" step.
    if (screen === "otp") {
        return (
            <OTPVerification
                email={email}
                otp={otp}
                onSuccess={handleSuccess}
                onBack={handleBack}
            />
        );
    }

    // Show the success screen once the user has been verified.
    if (screen === "success") {
        return <Success />;
    }

    // Default: show the login screen.
    return (
        <Login onOTPSent={handleOTPSent} />
    );
}

export default App;
