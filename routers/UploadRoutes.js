const express = require('express')
const { protect } = require("../controllers/middlewareController")
const { UploadController } = require('../controllers/UploadController')
const router = express.Router();

router.post("/image",protect,UploadController.UploadImage)
router.post('/file',protect, UploadController.Upload);
router.get('/download-file',protect, UploadController.Download);
module.exports = router;
