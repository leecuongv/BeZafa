const express = require("express");
const { verifyToken, verifyTokenAdmin, protect } = require("../controllers/middlewareController")
const {ChatController}= require("../controllers/ChatController")
const router = express.Router()

router.post("/", protect, ChatController.create)
router.get("/", protect, ChatController.fetchChats)
router.post("/group", protect, ChatController.createGroupChat)
router.put("/rename", protect, ChatController.renameGroup)
router.put("/remove-user-from-group", protect, ChatController.removeUserFromGroup)
router.put("/add-user-to-group", protect, ChatController.addUserToGroup)
router.put("/remove-user-from-group-admin", protect, ChatController.removeUserFromGroupAdmin)
router.put("/leave-chat", protect, ChatController.leaveGroupChat)
module.exports = router;
