const express = require('express')
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { StatisticController } = require('../controllers/StatisticsController')
const router = express.Router();


router.get("/number-of-users", verifyToken, StatisticController.GetNumberOfUsers)
router.get("/total-new-users-by-day", verifyToken, StatisticController.GetTotalNewUsersByDay)
router.get("/list-bills", verifyToken, StatisticController.GetListBills)
router.get("/list-bill-by-user", verifyToken, StatisticController.GetListBillByUser)
router.get("/sum-revenue", verifyToken, StatisticController.GetSumRevenue)
router.get("/total-revenue-by-day", verifyToken, StatisticController.GetTotalRevenueByDay)

module.exports = router;
