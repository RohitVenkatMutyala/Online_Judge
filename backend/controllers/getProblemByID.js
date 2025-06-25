const Question = require("../model/Question");
const getProblemByID = async (req, res) => {
  try {
    const { QID } = req.params;
    const question = await Question.findOne({ QID });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Problem with QID '${QID}' not found`
      });
    }

    res.status(200).json({
      success: true,
      problem: question
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = { getProblemByID };
