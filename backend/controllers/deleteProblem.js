const Question = require("../model/Question");
const TestCase = require("../model/TestCase");
const deleteProblem = async (req, res) => {
  try {
    const { QID } = req.params;
    const deleted = await Question.findOneAndDelete({ QID });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const deleteTest = async(req,res)=>{
    try {
    const { QID } = req.params;
    const deleted = await TestCase.findOneAndDelete({ QID });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { deleteProblem,deleteTest };
