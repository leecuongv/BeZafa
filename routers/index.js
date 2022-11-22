const AuthRoutes = require('./AuthRoutes')
const UserRoutes = require('./UserRoutes');
const SocialRoutes = require('./SocialRoutes');
const BillRoutes = require('./BillRoutes');
//const StatisticRoutes = require("./StatisticRoutes")  
const UploadRoutes = require("./UploadRoutes")  
//const AdminRoutes = require("./AdminRoutes")
const ChatRoutes = require("./ChatRoutes")
const MessageRoutes = require("./MessageRoutes")


module.exports = { 
    AuthRoutes, 
    UserRoutes, 
    SocialRoutes, 
    BillRoutes, 
  //  StatisticRoutes,
    UploadRoutes,
 //   AdminRoutes,
    ChatRoutes,
    MessageRoutes,
 }
