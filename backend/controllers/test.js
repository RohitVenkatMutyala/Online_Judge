const fs = require("fs");
const TestCase = require("../model/TestCase");
const Question = require("../model/Question");
const multer = require("multer");
const path = require("path");

// Multer Storage Setup
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'inputFile', maxCount: 1 },
  { name: 'outputFile', maxCount: 1 }
]);

const Test = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).send("Upload failed");

    try {
      const { QID } = req.body;
      const existingID = await Question.findOne({ QID });

      if (!existingID) {
        return res.status(404).json({
          success: false,
          message: `The Problem with QID ${QID} does not exist in the database.`
        });
      }

      const testID = await TestCase.findOne({ QID });
      if (testID) {
        return res.status(409).json({
          success: false,
          message: `Test cases already exist for Problem QID: ${QID}`
        });
      }

      const inputFile = req.files['inputFile'][0];
      const outputFile = req.files['outputFile'][0];

      const inputBuffer = fs.readFileSync(inputFile.path);
      const outputBuffer = fs.readFileSync(outputFile.path);

      const newTestCase = new TestCase({
        QID,
        inputTestCase: {
          filename: inputFile.originalname,
          contentType: inputFile.mimetype,
          data: inputBuffer
        },
        outputTestCase: {
          filename: outputFile.originalname,
          contentType: outputFile.mimetype,
          data: outputBuffer
        }
      });

      await newTestCase.save();
      try {
        fs.unlinkSync(inputFile.path);
        console.log(" Deleted input file:", inputFile.path);
      } catch (err) {
        console.error("Failed to delete input file:", err);
      }

      try {
        fs.unlinkSync(outputFile.path);
        console.log(" Deleted output file:", outputFile.path);
      } catch (err) {
        console.error(" Failed to delete output file:", err);
      }

      res.status(201).json({
        success: true,
        message: "✅ Test cases saved in MongoDB"
      });
    } catch (e) {
      console.error("❌ Server Error:", e);
      res.status(500).send("❌ Error storing test cases");
    }
  });
};

module.exports = { Test };
