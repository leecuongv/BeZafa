const express = require("express");
const {MessageController} = require("../controllers/MessageController")
const { protect, verifyTokenAdmin } = require("../controllers/middlewareController")

const router = express.Router();

router.get("/:chatId", protect, MessageController.allMessages)
router.post("/", protect, MessageController.sendMessage)

module.exports = router;