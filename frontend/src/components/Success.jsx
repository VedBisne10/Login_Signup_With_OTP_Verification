// Create the success component.
function Success() {

    // Display the successful login message.
    return (
        <div className="auth-container">

            <div className="auth-card success-card">

                <div className="success-icon">
                    ✓
                </div>

                <h1>
                    Login Successful
                </h1>

                <p>
                    Your email has been successfully verified.
                </p>

            </div>

        </div>
    );
}

// Export the Success component.
export default Success;