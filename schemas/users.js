//存储用户的表数据结构
var mongoose = require('mongoose');

//用户的表结构
module.exports = new mongoose.Schema({
    //用户名(字段：类型)
    username: String,
    //密码
    password:String,
    //是否是管理员
    isAdmin:{
        type:Number,
        default:0
    }
});
