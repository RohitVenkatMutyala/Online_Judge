const fs= require("fs");
const path = require("path");
const {v4:uuid}= require("uuid");
const dirInput = path.join(__dirname,"../inputs");
if(!fs.existsSync(dirInput)){
    fs.mkdirSync(dirInput,{recursive:true});
}

const generateInputFile=(input)=>{
    try {
        const jobId = uuid();
        const fileName = `${jobId}.txt`;
        const InputfilePath = path.join(dirInput,fileName);
        fs.writeFileSync( InputfilePath,input);
        return  InputfilePath;
 
        
    } catch (error) {
        console.error(error);
    }
}
module.exports={generateInputFile};