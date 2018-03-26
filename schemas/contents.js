var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({
    //分类的ID
    category:{
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'Category'
    },
    //内容标题
    title:String,
    //用户ID
    user:{
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'User'
    },
    //时间
    time:{
      type:Date,
      default:new Date()
    },
    //阅读量
    view:{
      type:Number,
      default:0
    },
    //简介
    description:{
        type:String,
        default:''
    },
    //内容
    content:{
        type:String,
        default:''
    },
    //评论的数据,可能有很多评论，把每天评论都当做是数组中的一条数据
    comments:{
        type:Array,
        default:[]
    }

});