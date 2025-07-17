const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Async function to execute a Python file
const executePy = async (filePath,InputfilePath) => {
    return new Promise((resolve, reject) => {
        const command = `python "${filePath}" < "${InputfilePath}"`; 

        exec(command,{timeout:2000}, (error, stdout, stderr) => {
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

module.exports = { executePy };
