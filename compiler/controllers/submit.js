const { generateFile } = require("./generateFile");
const { generateInputFile } = require("./generateInputFile");
const {  generateOutputFile } = require("./generateOutputFile");
const express =require("express");
const { TexecutePy } = require("./texecutePy");
const { TexecuteJava } = require("./texecuteJava");
const {TexecuteCpp}  = require("./texecuteCpp");
const cors= require("cors");
const app = express();
app.use(express.json());
const {db}= require("../firebase");
app.use(cors({
    origin: true,
    credentials: true
}));


const submit = async (req, res) => {
  //  console.log("Submit received body:", req.body);
    const { language = "cpp", code, input, expectedOutput ,id,QID } = req.body;

    if (!code || !input || !expectedOutput || !id || !QID) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const filepath = generateFile(language, code);
        const inputFilePath = generateInputFile(input);
        const outputFilePath = generateOutputFile(expectedOutput);

        let result;

        if (language === "cpp") {
            result = await TexecuteCpp(filepath, inputFilePath, outputFilePath);
        } else if (language === "py") {
            result = await TexecutePy(filepath, inputFilePath, outputFilePath);
        } else if (language === "java") {
            result = await TexecuteJava(filepath, inputFilePath, outputFilePath);
        } else {
            return res.status(400).json({ message: "Unsupported language" });
        }

      const verdict = result.passed === result.total ? "Passed" : "Failed";
      const submissionsDoc = {
        id,
        QID,
        code,
        language,
        verdict,
        submittedAt: new Date().toISOString()
      };
      await db.collection("submissions").add(submissionsDoc);

        return res.json({
            success: true,
            verdicts: result.verdicts,
            total: result.total,
            passed: result.passed,
            failed: result.failed,
            totalTimeMs: result.totalTimeMs,
        });

    } catch (error) {
        const cleanError = error.stderr || error.message || "Unknown error";

        return res.status(500).json({
            success: false,
            message: "Compilation or Execution Error",
            error: cleanError,
        });
    }
};

module.exports = { submit };
