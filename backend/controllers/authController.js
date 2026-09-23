const OTP = require("../models/OTP");

const User = require("../models/User");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (req, res) => {
    try{
        const { email } = req.body;

        if(!email){
            return res.status(400).json({
                message: "Email is required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otp = generateOTP();

        const expiresAt = new Date(Date.now() + 50 * 60 * 1000);

        await OTP.deleteMany({
            email : normalizedEmail
        });

        await OTP.create({
            email: normalizedEmail, 
            otp: otp, 
            expiresAt: expiresAt
        });

        const emailData = {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: {
                email: normalizedEmail,
                otp: otp
            }
        };

        const emailResponse = await fetch(
            "https://api.emailjs.com/api/v1.0/email/send",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(emailData)
            }
        );

        // Check whether EmailJS accepted the request.
        if (!emailResponse.ok) {

            // Read the error returned by EmailJS.
            const errorText = await emailResponse.text();

            // Log the EmailJS error.
            console.error(
                "EmailJS error:",
                errorText
            );

            // Delete the OTP because the email wasn't sent.
            await OTP.deleteMany({
                email: normalizedEmail
            });

            return res.status(500).json({
                message: "Failed to send OTP email."
            });
        }

        res.status(200).json({
            message : "OTP sent Successfully.",
            otp : otp
        });
    }
    catch (error){
        console.error(
            "Send OTP error: ",
            error.message
        );
        res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }
};

const verifyOTP = async (req, res) => {
    try { 
        const { email, otp } = req.body;
        if(!email || !otp){
            return res.status(400).json({
                message: "Email and OTP are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpRecord = await OTP.findOne({
            email: normalizedEmail
        });

        if(!otpRecord){
            return res.status(400).json({
                message: "OTP not found. Please request a new OTP."
            });
        }

        if (new Date() > otpRecord.expiresAt){
            await OTP.deleteOne({
                _id: otpRecord._id
            });

            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (otp !== otpRecord.otp){
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        let user = await User.findOne({
            email: normalizedEmail
        });

        if(!user){
            user = await User.create({
                email: normalizedEmail,
                verified: true
            });
        }
        else{
            user.verified = true;

            await user.save();
        }

        await OTP.deleteOne({
            _id: otpRecord._id
        });

        res.status(200).json({
            message: "OTP Verified Successfully.",
            loginSuccessful: true,
            user: {
                id: user._id,
                email: user.email,
                verified: user.verified
            }
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to verify OTP.",
            error: error.message
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP
};