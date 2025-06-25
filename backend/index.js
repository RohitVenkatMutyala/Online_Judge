const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const {login} = require("./controllers/login.js");
const {register} = require("./controllers/register.js");
const {logout} = require("./controllers/logout.js");
const {profile} = require("./controllers/profile.js");
//const {problems} = require("./controllers/problems.js");
const{problems}= require("./controllers/problems.js");
const {getAllProblems}= require("./controllers/getAllProblems.js");
const{getProblemByID}= require("./controllers/getProblemByID.js");
const { DBConnection } = require("./database/db.js");

const User = require("./model/User.js");
const Question = require("./model/Question.js");

//const Problem = require("./model/Problem.js");
const {deleteProblem} =require("./controllers/deleteProblem.js");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

DBConnection();
app.post("/logout",logout );

app.post("/problems",problems);
app.get("/problems", getAllProblems); // GET /api/problems
app.get("/problem/:QID", getProblemByID); // GET /api/problem/1
app.delete('/problem/:QID',deleteProblem);

app.get("/profile", profile);

app.get("/", (req, res) => {
    res.status(200).json({ 
        message: "AlgoU Auth Server is running!",
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

app.post("/register", register);
app.post("/login", login);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the server at: http://localhost:${PORT}`);
});
