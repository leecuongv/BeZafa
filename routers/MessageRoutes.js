const express = require("express");
const {MessageController} = require("../controllers/MessageController")
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")

const router = express.Router();

router.get("/:chatId", verifyToken, MessageController.allMessages)
router.post("/", verifyToken, MessageController.sendMessage)

module.exports = router;