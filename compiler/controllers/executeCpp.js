const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

// Create outputs directory if it doesn't exist
const outputPath = path.join(__dirname, "../outputs");
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Async function to compile and execute C++ file
const executeCpp = async (filePath,InputfilePath) => {
    const jobId = path.basename(filePath).split(".")[0]; // Extract job name (no extension)
    const outPath = path.join(outputPath, `${jobId}.out`); // Output executable path
    const outFileName = `${jobId}.out`;

    return new Promise((resolve, reject) => {
        const command = `g++ "${filePath}" -o "${outPath}" && "${outPath}" < "${InputfilePath}"`;

        exec(command, {timeout:2000},(error, stdout, stderr) => {
            if (error) {
                return reject({ message: "Compilation or execution error", error, stderr });
            }
            if (stderr) {
                return reject({ message: "Program ran with stderr", stderr });
            }
            resolve(stdout);
        });
    });
};

module.exports = { executeCpp};
