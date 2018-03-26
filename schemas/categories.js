//存储分类的表数据结构
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({
    //分类名(字段：类型)
    name: String,
});