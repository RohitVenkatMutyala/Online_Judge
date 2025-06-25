const mongoose = require("mongoose");
const ProbSchema = new mongoose.Schema({
    QID:{
        type : String,
        required :[true],
        
    },
    name:{
        type:String,
        required :[true],
    },
    tag:{
        type: String,
        required:[true],
    },
    description:{
        type: String,
        required:[true],
    },
  
    difficulty:{
        type: String,
        required: [true],
    },
    
},
{timestamps: true});
module.exports=mongoose.model("Question",ProbSchema);
