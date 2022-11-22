const express = require("express");
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { TakeExamController } = require('../controllers/TakeExamController')
const router = express.Router();

router.post('/take-exam', verifyToken, TakeExamController.CreateTakeExam);
router.post('/check-exam', verifyToken, TakeExamController.CheckExam);
router.post('/submit-exam', verifyToken, TakeExamController.submitAnswerSheet);
router.get('/get-preview-exam', verifyToken, TakeExamController.getPreviewExam);
router.get('/get-result-takeexam', verifyToken, TakeExamController.getResultTakeExam)
router.post("/create-log", verifyToken, TakeExamController.createLogs)
module.exports = router;
//đã sửa
