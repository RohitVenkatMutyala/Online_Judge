const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const TexecuteJava = async (filePath, inputFilePath, outputFilePath) => {
     const startTime = Date.now(); // Start time
    const jobId = "Main";  // 🔑 Java class name should match the filename
    const dir = path.dirname(filePath);
    const TIMEOUT_MS = 2000; // 2-second time limit

    const compileCommand = `javac "${filePath}"`;

    // ✅ Step 1: Compile Java File
    await new Promise((resolve, reject) => {
        exec(compileCommand, { timeout: 3000 }, (error, stdout, stderr) => {
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

    // ✅ Step 3: Execute for each input (stop on first failure)
    for (let i = 0; i < inputTests.length; i++) {
        const testInput = inputTests[i];

        const result = await new Promise((resolve, reject) => {
            const child = spawn("java", ["-cp", dir, jobId]);

            let stdout = "";
            let stderr = "";

            const timer = setTimeout(() => {
                child.kill("SIGKILL");
                reject("Time limit exceeded ⏱️");
            }, TIMEOUT_MS);

            child.stdin.write(testInput + "\n");
            child.stdin.end();

            child.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            child.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            child.on("close", (code) => {
                clearTimeout(timer);
                if (code !== 0 || stderr) {
                    return reject(stderr || `Exited with code ${code}`);
                }
                resolve(stdout.trim());
            });
        }).catch(error => error);

        const expected = outputTests[i] || "";

        const verdict = {
            testCase: i + 1,
            expected,
            actual: typeof result === "string" ? result : "",
            verdict: "",
            error: typeof result !== "string" ? result : undefined
        };

        if (result === expected) {
            verdict.verdict = "Passed ✅";
        } else if (result === "Time limit exceeded ⏱️") {
            verdict.verdict = "Time Limit ⏱️";
            verdicts.push(verdict);
            break; // stop on timeout
        } else {
            verdict.verdict = "Failed ❌";
            verdicts.push(verdict);
            break; // stop on wrong output
        }

        verdicts.push(verdict);
    }
const endTime = Date.now();           // End time
const totalTime = endTime - startTime; // In milliseconds
    return {
        total: inputTests.length,
        attempted: verdicts.length,
        passed: verdicts.filter(v => v.verdict === "Passed ✅").length,
        failed: verdicts.filter(v => v.verdict === "Failed ❌").length,
        timedOut: verdicts.filter(v => v.verdict === "Time Limit ⏱️").length,
         totalTimeMs:totalTime,
        verdicts
    };
};

module.exports = { TexecuteJava };
