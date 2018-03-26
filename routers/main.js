var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var Content = require('../models/content');
//处理通用的数据
var data = {};
router.use(function (req,res,next) {
    data.userinfo = req.userinfo;
    Category.find().then(function (info) {
        data.navinfo = info;
        next();
    });
});

//先得到路由再去数据库里查找信息
    router.get('/',function (req,res,next) {
        //因为这个模块的操作会被导出到app.js,里面有对模板的配置，设置，和注册，所有这里不用对模板进行注册等操作
        //为了在前端使用cookie里的数据，在模板的第二个参数把cookie数据传过去
            data.page = Number(req.query.page || 1);
            //将点击的分类保存在变量中，以便传给前端使用
            data.category = req.query.category || '';
            data.number  =  2;
            data.pages = 0;
            data.contents = [];

        // 判断当前传递过来的url中是否包含category参数,如果不包含参数，则查询全部
        var where = {};
        if(data.category){
            where.category = data.category;
        }

           //return时，把数据库的信息return给下一个then(function())里的参数
        Content.where(where).count().then(function (count) {
            data.pages = Math.ceil(count/data.number);
            //用户传过来的页数不能多于存在的页数
            data.page = Math.min(data.page,data.pages);
            data.page = Math.max(data.page,1);
            //where-->带条件查询 sort-->根据时间排序  populate --> 将关联的表中的信息赋给所在的字段
            return Content.where(where).find().sort({time:-1}).populate(['category','user']).limit(data.number).skip((data.page-1)*data.number)
        }).then(function (contents) {
            data.contents = contents;
            // console.log(data);
            res.render('main/index',data);
        });
});

    //处理点击阅读全文之后的页面
    router.get('/view',function (req,res) {
       var contentid = req.query.content;
       Content.findById(contentid).then(function (info) {
           info.view += 1;
           info.save();
           data.content = info;
           res.render('main/view',data);
       })
    });
//把值传回去
module.exports = router;