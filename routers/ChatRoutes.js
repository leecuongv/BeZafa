const express = require("express");
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const {ChatController}= require("../controllers/ChatController")
const router = express.Router()

router.post("/", verifyToken, ChatController.create)
router.get("/", verifyToken, ChatController.fetchChats)
router.post("/group", verifyToken, ChatController.createGroupChat)
router.put("/rename", verifyToken, ChatController.renameGroup)
router.put("/remove-user-from-group", verifyToken, ChatController.removeUserFromGroup)
router.put("/add-user-to-group", verifyToken, ChatController.addUserToGroup)

module.exports = router;
