const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");



const TexecutePy = async (filePath, inputFilePath, outputFilePath) => {
  const startTime = Date.now(); // Start time
  const inputContent = fs.readFileSync(inputFilePath, "utf-8");
  const expectedContent = fs.readFileSync(outputFilePath, "utf-8");

  const inputTests = inputContent.split("------").map(x => x.trim()).filter(Boolean);
  const outputTests = expectedContent.split("------").map(x => x.trim()).filter(Boolean);

  const verdicts = [];
  const TIMEOUT_MS = 2000; // 2-second timeout per test case

  for (let i = 0; i < inputTests.length; i++) {
    const testInput = inputTests[i];

    const result = await new Promise((resolve, reject) => {
      const child = spawn("python3", [filePath]);

      let stdout = "";
      let stderr = "";

      // ⏱ Kill process if it exceeds time limit
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject({ error: "Time limit exceeded ⏱️" });
      }, TIMEOUT_MS);

      child.stdin.write(testInput);
      child.stdin.end();

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        clearTimeout(timer); // Cancel timer if it ends
        if (code !== 0 || stderr) {
          return reject({ error: stderr || "Runtime error" });
        }
        resolve(stdout.trim());
      });
    }).catch(err => err.error);

    const expected = outputTests[i] || "";

    verdicts.push({
      testCase: i + 1,
      expected,
      actual: typeof result === "string" ? result : "",
      verdict: result === expected ? "Passed ✅" : (result === "Time limit exceeded ⏱️" ? "Time Limit ⏱️" : "Failed ❌"),
      error: typeof result !== "string" ? result : undefined
    });
    if (expected!==result){
      break;
    }
  }
 const endTime = Date.now();           // End time
const totalTime = endTime - startTime; // In milliseconds


  return {
    total: inputTests.length,
    passed: verdicts.filter(v => v.verdict === "Passed ✅").length,
    failed: verdicts.filter(v => v.verdict === "Failed ❌").length,
    timedOut: verdicts.filter(v => v.verdict === "Time Limit ⏱️").length,
    totalTimeMs:totalTime,
    verdicts
  };
};

module.exports = { TexecutePy };
