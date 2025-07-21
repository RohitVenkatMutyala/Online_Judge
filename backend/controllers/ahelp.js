const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API });

const Ahelp = async (code) => {
  
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `If my code almost going to be correct then guide with the simple steps making it correct and give some score for the existing code ${code}` ,
    });
       console.log(response.text);
    return response.text;

};

module.exports = {
Ahelp
};