var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Content = require('../models/content');
//统一返回格式
var responseData;
//进来的不管是什么路由，都会初始化返回数据，code--》是否正确，message --> 错误信息
router.use(function (req,res,next) {
    responseData = {
       code:0,
       message:''
    };
    //如果不使用next，请求将被挂起，后面定义的中间件将得不到被执行的机会
    next();
});

//用户注册
//注册逻辑
/*
1.用户名不能为空
2.密码不能为空
3.两次输入密码必须一致

1.用户是否被注册  --》 数据库查询
 */

router.post('/user/register',function (req,res,next) {
    // console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    //判断用户名是否为空
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        //用json格式将数据传回给前端
        res.json(responseData);
        // return;
    }
    //判断密码
    else if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        // return;
    }
    //判断两次密码是否一致
    else if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        // return;
    }

    //查找用户名与数据库中的用户名是否重合
    //数据库操作，将其当做对象处理,findone返回的是一个promise对象
    else{
    User.findOne({
        username:username
    }).then(function (userInfo) {
        // console.log(userInfo);
        if(userInfo){
            //表示数据库中有重复的用户注册信息
            responseData.code = 4;
            responseData.message = '用户名已经被注册';
            res.json(responseData);
            // return;
        }
        //保存用户注册的信息到数据库中
        else{
            var user = new User({
                username:username,
                password:password
            });
            return user.save();  //保存
        }

    }).then(function (newUserInfo) {
        // console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json(responseData);
    });
    }


    // return;
});


//用户登录
router.post('/user/login',function (req,res,next) {
    // console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;

    if (username == '' || password == ''){
        responseData.message = '用户名或者密码不能为空';
        responseData.code = 1;
        res.json(responseData);
    }
    else{
    User.findOne({
        username:username,
        password:password
    }).then(function (userinfo) {
        if(userinfo){
            // console.log(userinfo);
            responseData.message = '登录成功';
            responseData.info ={
                username:userinfo.username,
                id:userinfo._id
            };
            //发送cookie至浏览器,将用户名使用字符串的形式保存在userinfo中
            req.cookies.set('userinfo',JSON.stringify(responseData.info));
            res.json(responseData);
            return;
        }

        responseData.code = 2;
        responseData.message = '用户名或密码出错，登录失败';
        res.json(responseData);
    })
    }
});

//用户退出
router.get('/user/logout',function (req,res) {
    req.cookies.set('userinfo',null);
    res.json(responseData);
});

//处理评论数据
router.post('/comment',function (req,res) {
    Content.findById(req.body.contentid).then(function (info) {
        //在数据库中的comments字段中将提交过来的评论保存
        info.comments.push(req.body);
        //保存在数据中,数据库的保存是对整个数据库对象操作
        return info.save();
    }).then(function (newinfo) {
        responseData.comments = newinfo.comments.reverse();
        responseData.message = '评论保存成功';
        res.json(responseData);
    })
});
//处理一进来就显示所有的评论
router.get('/comment',function (req,res) {
    //ajax传过来的参数在query中
    Content.findById(req.query.contentid).then(function (info) {
        // console.log(info);
        responseData.comments = info.comments.reverse();
        res.json(responseData);
    })
});

//把值传回去
module.exports = router;