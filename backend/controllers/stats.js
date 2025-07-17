const Question = require("../model/Question");
const User = require("../model/User");
const UserQuestionStatus = require("../model/UserQuestionStatus");

const Stats = async (req, res) => {
  try {
    const { QID, id, status } = req.body;

    const question = await Question.findOne({ QID });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Problem with QID '${QID}' not found`,
      });
    }

    const foundUser = await User.findById(id);
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: `User not found`,
      });
    }

    const userStatus = status || "UnSolved";

    const statusEntry = await UserQuestionStatus.findOneAndUpdate(
      { user: foundUser._id, question: question._id },
      { status: userStatus },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Problem ${QID} marked as '${userStatus}' for user ${foundUser.firstname}.`,
      data: statusEntry,
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
