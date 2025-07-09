const Question = require("../model/Question");

const Stats = async (req, res) => {
  try {
    const QID = req.body.QID; // ✅ Correct: from POST body

    const question = await Question.findOne({ QID });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Problem with QID '${QID}' not found`,
      });
    }

    question.status = "Solved";
    await question.save();

    res.status(200).json({
      success: true,
      message: `Problem ${QID} marked as Solved.`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { Stats };
