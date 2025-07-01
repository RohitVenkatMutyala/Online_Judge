const fs= require("fs");
const path = require("path");
const {v4:uuid}= require("uuid");
const dirCodes = path.join(__dirname,"../Codes");
if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes,{recursive:true});
}

const generateFile=(language,code)=>{
    try {
        const jobId = uuid();
        const fileName = `${jobId}.${language}`;
        const filePath = path.join(dirCodes,fileName);
        fs.writeFileSync(filePath,code);
        return  filePath;
 
        
    } catch (error) {
        console.error(error)
    }
}
module.exports={generateFile};