const Question = require("../model/Question");
const problems= async(req,res)=>{
    try {
        const {QID,name,tag,description,difficulty}=req.body;
        if(!(QID && name && tag && description && difficulty)){
            return res.status(400).json({
               success: false,
               message: "Please provide all required information"
            })
        }
        const existingID = await Question.findOne({QID});
        if (existingID){
            return res.status(409).json({
                success : false,
                message: "Problem with ID already exists" })
        }
    const Questions = await Question.create({
        QID,
        name,
        tag,
        description,
        difficulty,
    });
    const Questiondesc ={
        _id:Questions._id,
        ProblemID: Questions.QID,
        name:Questions.name,
        tag:Questions.tag,
        description: Questions.description,
        difficulty: Questions.difficulty,
        time: Questions.createdAt
    };
    res.status(201).json({
        success:true,
        message:"Problem Posted Successfully",
        problem:Questiondesc,
    })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}
module.exports={problems};