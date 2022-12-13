const express = require('express')
const { protect, verifyTokenAdmin } = require("../controllers/middlewareController")
const { UserController } = require('../controllers/UserController')
const router = express.Router();

router.get('/info', protect, UserController.getInfo);
router.get('/info-short', protect, UserController.getInfoShort);
router.put('/update-profile', protect, UserController.updateUser);
router.put('/update-avatar', protect, UserController.updateAvatar);
router.put('/reset-avatar', protect, UserController.resetAvatar);
router.put('/change-password', protect, UserController.updatePassword);
router.put('/update-device-token', protect, UserController.updateDeviceToken);

router.put('/update-role', protect, UserController.updateRoles)

router.delete('/', verifyTokenAdmin, UserController.deleteAccount)
router.get("/", protect, UserController.searchAllUsers)

module.exports = router;