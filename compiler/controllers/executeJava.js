const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Async function to execute a Python file
const executeJava = async (filePath,InputfilePath) => {
    return new Promise((resolve, reject) => {
        const command = `java "${filePath}" < "${InputfilePath}"`; // or 'python3' if needed on your system

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject({ message: "Execution error", error, stderr });
            }
            if (stderr) {
                return reject({ message: "Program ran with stderr", stderr });
            }
            resolve(stdout);
        });
    });
};

module.exports = { executeJava };
