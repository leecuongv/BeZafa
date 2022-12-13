const express = require('express')
const { protect, verifyTokenAdmin } = require("../controllers/middlewareController")
const { StatisticController } = require('../controllers/StatisticsController')
const router = express.Router();


router.get("/number-of-users", protect, StatisticController.GetNumberOfUsers)
router.get("/total-new-users-by-day", protect, StatisticController.GetTotalNewUsersByDay)
router.get("/list-bills", protect, StatisticController.GetListBills)
router.get("/list-bill-by-user", protect, StatisticController.GetListBillByUser)
router.get("/sum-revenue", protect, StatisticController.GetSumRevenue)
router.get("/total-revenue-by-day", protect, StatisticController.GetTotalRevenueByDay)

module.exports = router;
