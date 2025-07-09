const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
    filename:{
        type:String,
        required: true,

    },
    contentType:{
        type:String,
        required:true,
    },
    data:{
        type:Buffer,
        required:true,
    }
})
const testSchema = new mongoose.Schema({
     QID:{
        type : Number,
        required :[true],
    unique: true},
    inputTestCase:{
        type: fileSchema,
        required: true,
    },
    outputTestCase:{
        type: fileSchema,
        required:true,
    },
  

})
module.exports = mongoose.model("TestCase",testSchema);