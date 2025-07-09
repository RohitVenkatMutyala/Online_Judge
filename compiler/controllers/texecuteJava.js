const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const TexecuteJava = async (filePath, inputFilePath, outputFilePath) => {
    const jobId = "Main";  // 🔑 Java class name should match the filename
    const dir = path.dirname(filePath);

    const compileCommand = `javac "${filePath}"`;

    // ✅ Step 1: Compile Java File
    await new Promise((resolve, reject) => {
        exec(compileCommand, (error, stdout, stderr) => {
            if (error) {
                return reject({ message: "Compilation failed", error: stderr || error.message });
            }
            resolve();
        });
    });

    // ✅ Step 2: Read test inputs/outputs
    const inputContent = fs.readFileSync(inputFilePath, "utf-8");
    const expectedContent = fs.readFileSync(outputFilePath, "utf-8");

    const inputTests = inputContent.split("------").map(x => x.trim()).filter(Boolean);
    const outputTests = expectedContent.split("------").map(x => x.trim()).filter(Boolean);

    const verdicts = [];

    // ✅ Step 3: Execute for each input
    for (let i = 0; i < inputTests.length; i++) {
        const testInput = inputTests[i];

        const result = await new Promise((resolve, reject) => {
            const child = spawn("java", ["-cp", dir, jobId]);

            let stdout = "";
            let stderr = "";

            child.stdin.write(testInput + "\n");
            child.stdin.end();

            child.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            child.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            child.on("close", (code) => {
                if (code !== 0 || stderr) {
                    return reject({ message: "Execution error", error: stderr || `Exited with code ${code}` });
                }
                resolve(stdout.trim());
            });
        });

        const expected = outputTests[i] || "";

        verdicts.push({
            testCase: i + 1,
            expected,
            actual: result,
            verdict: result === expected ? "Passed ✅" : "Failed ❌"
        });
    }

    return {
        total: inputTests.length,
        passed: verdicts.filter(v => v.verdict === "Passed ✅").length,
        failed: verdicts.filter(v => v.verdict === "Failed ❌").length,
        verdicts
    };
};

module.exports = { TexecuteJava };
