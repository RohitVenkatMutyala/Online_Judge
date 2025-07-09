const TestCase = require("../model/TestCase");
const gtest=async(req,res)=>{
try {
  const {QID} = req.params;
  const testcase = await TestCase.findOne({QID:Number(QID)});
  if (!testcase){
    return res.status(404).json({
        success: false,
        message: `No test case present with these ${QID}`
 });

  }
   res.status(200).json({
    success:true,
    test: testcase,
   })


} catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
    
}
}
module.exports={gtest};