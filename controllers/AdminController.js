const mongoose = require("mongoose");
const jwt_decode = require('jwt-decode')
const User = require("../models/User")
const { STATUS, VIEWPOINT, ROLES } = require("../utils/enum");
const moment = require("moment/moment");

const AdminController = {

    activeUserByAdmin: async (req, res) => {
        try {
            const userId = req.body.userId;
            const updateUser = await User.findByIdAndUpdate(userId, { status: STATUS.ACTIVE }, { new: true })

            if (updateUser)
                return res.status(200).json(updateUser)
            return res.status(400).json({ message: "Kích hoạt tài khoản thất bại" })
        }
        catch (error) {
            console.log("Lỗi kích hoạt tài khoản" + error)
            return res.status(500).json({ message: "Lỗi kích hoạt tài khoản" })
        }
    },

    inactiveUserByAdmin: async (req, res) => {
        try {
            const userId = req.body.userId;
            const updateUser = await User.findByIdAndUpdate(userId, { status: STATUS.INACTIVE }, { new: true })
            if (updateUser)
                return res.status(200).json(updateUser)
            return res.status(400).json({ message: "Hủy kích hoạt tài khoản thất bại" })
        }
        catch (error) {
            console.log("Lỗi hủy kích hoạt tài khoản"+error)
            return res.status(400).json({ message: "Lỗi hủy kích hoạt tài khoản" })
        }
    },

    updateUserRole: async (req, res) => {
        try {
            const rolesRequest = req.body.roles;
            const username = req.body.username;
            let roles = []
            const getRoles = async (list) => {
                const roles = []
                for (let i = 0; i < list.length; i++) {
                    let role = await Role.findOne({ name: list[i] })
                    roles.push(role)
                }
                return roles
            }
            roles = await getRoles(rolesRequest)
            if (username) {
                const newUser = await User.updateOne({ username }, { roles: roles.map(item => item.id) }, { new: true })
                if (newUser)
                    return res.status(200).json({ message: "Cập nhật quyền thành công" })

                else
                    return res.status(400).json({ message: "Cập nhật không thành công" })
            } else
                return res.status(400).json({ message: "Không có username" })
        }
        catch (error) {
            console.log("Lỗi cập nhật quyền tài khoản"+error)
            return res.status(500).json({ message: "Lỗi cập nhật quyền tài khoản" })
        }
    },

    deleteUserById: async (req, res) => {
        try {
            const userId = req.query.id;
            const user = await User.findById(userId)
            if (!user)
                return res.status(400).json({
                    message: "Không tìn thấy người dùng!"
                })
            let name = user.fullname
            let deleteUser = User.findByIdAndDelete(userId)
            if (deleteUser)
                return res.status(200).json({
                    message: "Xóa người dùng " + name + " thành công!"
                })
            return res.status(200).json({
                message: "Xóa người dùng " + name + " thất bại!"
            })
        }
        catch (error) {
            console.log("Lỗi xóa người dùng"+ error)
            return res.status(500).json({ message: "Lỗi xóa người dùng" })
        }
    },

    GetListUser: (req, res) => {
        try {
            User.find().sort({ fullname: -1 })
                .then(result => {
                    res.status(200).json(ResponseData(200, result))
                }).
                catch(err => {
                    console.log("Lỗi lấy danh sách người dùng!"+err)
                    res.status(400).json({ message: "Lỗi lấy danh sách người dùng!" })
                })
        } catch (error) {
            console.log("Lỗi lấy danh sách người dùng" + error)
            res.status(400).json({ message: "Lỗi lấy danh sách người dùng" })
        }
    },
}

module.exports = { AdminController }
