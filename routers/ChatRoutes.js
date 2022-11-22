const express = require("express");
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const {ChatController}= require("../controllers/ChatController")
const router = express.Router()

router.post("/", verifyToken, ChatController.accessChat)
router.get("/", verifyToken, ChatController.fetchChats)
router.post("/group", verifyToken, ChatController.createGroupChat)
router.put("/rename", verifyToken, ChatController.renameGroup)
router.put("/remove-from-group", verifyToken, ChatController.removeFromGroup)
router.put("/add-to-group", verifyToken, ChatController.addToGroup)

module.exports = router;
