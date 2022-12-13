const mongoose = require("mongoose");
const User = require("../models/User")
const jwt_decode = require('jwt-decode')
const { STATUS, VIEWPOINT } = require("../utils/enum");
const moment = require("moment/moment");
const Bill = require('../models/Bill')
const StatisticController = {
    GetTotalNewUsersByDay: async (req, res) => {
        try {
            const admin = req.user.sub
            if (!admin)
                return res.status(400).json({
                    message: "Không tồn tại tài khoản"
                })
            if (admin.role !== ROLES.ADMIN)
                return res.status(400).json({
                    message: "Không có quyền truy cập"
                })
            let listUsers = await User.find()
            listUsers = listUsers.map(item => {
                if (item._doc.hasOwnProperty('createdAt')) {
                    return {
                        item,
                        dateAdd: format(item.createdAt, 'yyyy-MM-dd')
                    }
                }
                return {
                    item,
                    dateAdd: "2022-04-08"
                }
            })
            var result = [];
            listUsers.reduce(function (res, value) {
                if (!res[value.dateAdd]) {
                    res[value.dateAdd] = { dateAdd: value.dateAdd, sum: 0 };
                    result.push(res[value.dateAdd])
                }
                res[value.dateAdd].sum++;
                return res;
            }, {});

            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Không xác định" })

        }
    },

    GetListBills: async (req, res) => {
        try {
            let listPayments = await Bill.find().populate('creatorId')
            listPayments = listPayments.map(item => {
                return {
                    name: item.creatorId.fullname,
                    amount: item.amount,
                    description: item.description,
                    status: item.status,
                    createdAt: item.createdAt
                }
            })
            return res.status(200).json(ResponseData(200, listPayments))
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Không xác định" })
        }
    },
    GetListBillByUser: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            let listPayments = await Bill.find({ userId: loginUser.id })

            listPayments = listPayments.map(item => {
                return {
                    id: item.id,
                    name: item.creatorId.fullname,
                    amount: item.amount,
                    description: item.description,
                    status: item.status,
                    method: item.method,
                    updatedAt: item.updatedAt
                }
            })
            return res.status(200).json(listPayments)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Không xác định" })
        }
    },
    GetSumRevenue: async (req, res) => {
        try {
            let listPayments = await Bill.find()
            var tempTotalRevenue = 0
            listPayments.forEach((item, index) => {
                tempTotalRevenue += item.amount
            })
            return res.status(200).json({ totalRevenue: tempTotalRevenue })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Không xác định" })
        }
    },
    GetTotalRevenueByDay: async (req, res) => {
        try {
            let listPayments = await Bill.find()
            listPayments = listPayments.map(item => {
                return {
                    item,
                    dateAdd: format(item.createdAt, 'yyyy-MM-dd')
                }
            })
            var result = [];
            listPayments.reduce(function (res, value) {
                if (!res[value.dateAdd]) {
                    res[value.dateAdd] = { dateAdd: value.dateAdd, amount: 0 };
                    result.push(res[value.dateAdd])
                }
                res[value.dateAdd].amount += value.item.amount;
                return res;
            }, {});

            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Không xác định" })
        }
    },
}

module.exports = { StatisticController }

