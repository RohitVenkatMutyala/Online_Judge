const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "../outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const TexecuteCpp = async (filePath, inputFilePath, outputFilePath) => {
   const startTime = Date.now(); // Start time
  const jobId = path.basename(filePath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  // Step 1: Compile the code
  const compileCommand = `g++ "${filePath}" -o "${outPath}"`;

  await new Promise((resolve, reject) => {
    exec(compileCommand, { timeout: 3000 }, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject({ message: "Compilation failed", stderr: stderr || error.message });
      }
      resolve();
    });
  });

  // Step 2: Read test cases
  const inputContent = fs.readFileSync(inputFilePath, "utf-8");
  const expectedContent = fs.readFileSync(outputFilePath, "utf-8");

  const inputTests = inputContent.split("------").map(x => x.trim()).filter(Boolean);
  const outputTests = expectedContent.split("------").map(x => x.trim()).filter(Boolean);

  const verdicts = [];
  const TIMEOUT_MS = 2000;

  // Step 3: Loop through test cases
  for (let i = 0; i < inputTests.length; i++) {
    const testInput = inputTests[i];

    const result = await new Promise((resolve, reject) => {
      const child = spawn(outPath);

      let stdout = "";
      let stderr = "";

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject("Time limit exceeded ⏱️");
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
        clearTimeout(timer);
        if (code !== 0 || stderr) {
          return reject(stderr || "Runtime error");
        }
        resolve(stdout.trim());
      });
    }).catch(error => error);

    const expected = outputTests[i] || "";

    verdicts.push({
      testCase: i + 1,
      expected,
      actual: typeof result === "string" ? result : "",
      verdict: result === expected ? "Passed ✅" :
        result === "Time limit exceeded ⏱️" ? "Time Limit ⏱️" : "Failed ❌",
      error: typeof result === "string" ? undefined : result
    });
    if(expected!==result){
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

module.exports = { TexecuteCpp };
