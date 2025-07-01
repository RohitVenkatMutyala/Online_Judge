const express =require("express");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const { executeJava }= require("./executeJava");
const cors= require("cors");
const { generateInputFile } = require("./generateInputFile");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
const run = async (req, res) => {
    const { language = "cpp", code ,input } = req.body;

    if (!code) {
        return res.status(400).json({ message: "Please provide valid code" });
    }

    try {
        const filepath = generateFile(language, code);
        const InputfilePath = generateInputFile(input);
        let output;

        if (language === "cpp") {
            output = await executeCpp(filepath,InputfilePath);
        } else if (language === "py") {
            output = await executePy(filepath,InputfilePath);
        } 
         else if (language === "java") {
            output = await executeJava(filepath,InputfilePath);
        }
        else {

            return res.status(400).json({ message: "Unsupported language" });
        }

        res.json({
            success: true,
            filepath,
            output,
        });

    } catch (error) {
       
        let cleanError = error.stderr || error.message || "Unknown error";

        
        cleanError = cleanError.replace(/([A-Za-z]:)?[^\s:]+\.cpp:\d+:\d+:/g, 'Line $&'); 
        cleanError = cleanError.replace(/([A-Za-z]:)?[^\s:]+\.cpp/g, 'YourCode.cpp'); 
           cleanError = cleanError.replace(/([A-Za-z]:)?[^\s:]+\.py:\d+:\d+:/g, 'Line $&');
        cleanError = cleanError.replace(/([A-Za-z]:)?[^\s:]+\.py/g, 'YourCode.py');
          cleanError = cleanError.replace(/([A-Za-z]:)?[^\s:]+\.java:\d+:\d+:/g, 'Line $&');
        cleanError = cleanError.replace(/([A-Za-z]:)?[^\s:]+\.java/g, 'YourCode.java');

        res.status(500).json({
            success: false,
            message: "Compilation or Execution Error",
            error: cleanError,
        });
    }
}  
module.exports={run};