const express = require("express");
const { generateFile } = require("./controllers/generateFile");
const { executeCpp } = require("./controllers/executeCpp");
const { executePy } = require("./controllers/executePy");
const { executeJava }= require("./controllers/executeJava");
const{run} = require("./controllers/run");
const cors= require("cors");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/run", run);

app.listen(9000, () => {
    console.log("Server is live on port 9000");
});
