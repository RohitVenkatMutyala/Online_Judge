const { GoogleGenAI } = require("@google/genai");
const Question = require("../model/Question");
const dotenv = require('dotenv');

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API });

const Ahelp = async (code,QID) => {
   const question = await Question.findOne({ QID });
   
   const desc = question.description ;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Here is my problem description: ${desc}, and my code: ${code}; if the code is almost correct, guide me with simple steps to fix it and give a score, otherwise, guide me clearly based on the problem description. ` ,
    });
      
    return response.text;

};

module.exports = {
Ahelp
};