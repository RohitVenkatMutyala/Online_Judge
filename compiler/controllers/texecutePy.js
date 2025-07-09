const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const TexecutePy = async (filePath, inputFilePath, outputFilePath) => {
  const inputContent = fs.readFileSync(inputFilePath, "utf-8");
  const expectedContent = fs.readFileSync(outputFilePath, "utf-8");

  const inputTests = inputContent.split("------").map(x => x.trim()).filter(Boolean);
  const outputTests = expectedContent.split("------").map(x => x.trim()).filter(Boolean);

  const verdicts = [];

  for (let i = 0; i < inputTests.length; i++) {
    const testInput = inputTests[i];

    const result = await new Promise((resolve, reject) => {
      const child = spawn("python3", [filePath]);

      let stdout = "";
      let stderr = "";

      child.stdin.write(testInput);
      child.stdin.end();

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code !== 0 || stderr) {
          return reject({ error: stderr || "Runtime error" });
        }
        resolve(stdout.trim());
      });
    });

    const expected = outputTests[i] || "";

    verdicts.push({
      testCase: i + 1,
      expected,
      actual: result,
      verdict: result === expected ? "Passed ✅" : "Failed ❌",
    });
  }

  return {
    total: inputTests.length,
    passed: verdicts.filter(v => v.verdict === "Passed ✅").length,
    failed: verdicts.filter(v => v.verdict === "Failed ❌").length,
    verdicts
  };
};

module.exports = { TexecutePy };
