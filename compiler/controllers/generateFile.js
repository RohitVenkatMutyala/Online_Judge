const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

// Directory to save code files
const dirCodes = path.join(__dirname, "../Codes");

// Ensure directory exists
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

/**
 * Generates a code file for the given language and returns its path.
 * If language is Java, the filename will be Main.java to match public class.
 */
const generateFile = (language, code) => {
  try {
    const jobId = uuid();

    // Java must be 'Main.java' if public class Main is used
    const fileName = language === "java" ? "Main.java" : `${jobId}.${language}`;
    const filePath = path.join(dirCodes, fileName);

    fs.writeFileSync(filePath, code);
    return filePath;

  } catch (error) {
    console.error("File generation error:", error);
    throw error; // Optional: allow the caller to handle the error
  }
};

module.exports = { generateFile };
