const Question = require("../model/Question");
 const UserQuestionStatus = require("../model/UserQuestionStatus.js");
const problems= async(req,res)=>{
    try {
        const {QID,name,tag,description,difficulty ,status ="Not ATTEMPTED"}=req.body;
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
const AlProblems = async (req, res) => {
  try {
    const { userId } = req.params;

    const questions = await Question.find();
    const statuses = await UserQuestionStatus.find({ user: userId });

    const statusMap = {};
    statuses.forEach(entry => {
      statusMap[entry.question.toString()] = entry.status;
    });

    const response = questions.map(q => ({
      QID: q.QID,
      name: q.title,
      tag: q.tag,
      difficulty: q.difficulty,
      status: statusMap[q._id.toString()] || 'Unsolved',
    }));

    res.json({ success: true, problems: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}
;

module.exports={problems,AlProblems};