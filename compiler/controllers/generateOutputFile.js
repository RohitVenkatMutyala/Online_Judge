const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const outputDir = path.join(__dirname, "../newoutputs");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const generateOutputFile = (content) => {
    const jobId = uuid();
    const filename = `${jobId}.txt`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, content);
    return filepath;
};

module.exports = { generateOutputFile };
