const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log("MongoDB connected successfully.");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

app.get("/", (req, res) => {
    res.json({message: "Backend is working"});
});

app.post("/test-user", async(req, res) => {
    try{
        const { email } = req.body;
        if(!email){
            return res.status(400).json({
                message: "Email is required."
            });
        }
        const user = await User.create({
            email: email
        });

        res.status(201).json({
            message: "User created successfully.", 
            user: user
        });
    }
    catch (error){
        res.status(500).json({
            message: "Failed to create user.",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});