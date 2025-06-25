const Question = require("../model/Question");

const getAllProblems = async (req, res) => {
  try {
    // Sort by QID (ascending). Use -1 for descending if needed.
    const questions = await Question.find().sort({ QID: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      problems: questions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = { getAllProblems };
