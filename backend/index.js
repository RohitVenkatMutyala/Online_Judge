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
const{problems}= require("./controllers/problems.js");
const {getAllProblems}= require("./controllers/getAllProblems.js");
const{getProblemByID}= require("./controllers/getProblemByID.js");
const { DBConnection } = require("./database/db.js");
 const UserQuestionStatus = require("./model/UserQuestionStatus.js");
const User = require("./model/User.js");
const Question = require("./model/Question.js");
const {deleteProblem} =require("./controllers/deleteProblem.js");
const{deleteTest}=require("./controllers/deleteProblem.js");
const { Test } = require("./controllers/test.js");
const {gtest} = require("./controllers/gettest.js");
const {Stats} = require("./controllers/stats.js");
const {AlProblems} = require("./controllers/problems.js");
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
app.post("/test",Test)

app.post("/problems",problems);
app.get("/problems", getAllProblems); // GET /api/problems
app.get("/problem/:QID", getProblemByID); // GET /api/problem/1
app.delete('/problem/:QID',deleteProblem);
app.delete("/test/:QID",deleteTest);
app.get("/test/:QID",gtest);
app.get("/profile", profile);
app.post("/rd",Stats);
app.get("/", (req, res) => {
    res.status(200).json({ 
        message: "AlgoU Auth Server is running!",
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});
// routes/problemRoute.js
app.get('/problems/user/:userId', AlProblems);

app.post("/register", register);
app.post("/login", login);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the server at: http://localhost:${PORT}`);
});
