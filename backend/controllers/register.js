const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const register =  async (req, res) => {
    
    try {
        const { firstname, lastname, email, password , role } = req.body;

        if (!(firstname && lastname && email && password || role)) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required information: firstname, lastname, email, and password"
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
        });

        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email 
            }, 
            process.env.SECRET_KEY, 
            {
                expiresIn: "24h",
            }
        );

        const userResponse = {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json({ 
            success: true,
            message: "User registered successfully!",
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error("Registration error:", error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
}
module.exports={register};