// ─────────────────────────────────────────────
// Success.jsx
// The final screen shown after the user successfully
// verifies their OTP. It displays a confirmation
// message and a checkmark icon.
// No props are needed — it's purely a display screen.
// ─────────────────────────────────────────────

function Success() {
    return (
        <div className="auth-card success-card">

            {/* Checkmark icon to signal success visually */}
            <div className="success-icon"> ✓ </div>

            <h1> Login Successful </h1>
            <p> Your email has been successfully verified. </p>

        </div>
    );
}

export default Success;
