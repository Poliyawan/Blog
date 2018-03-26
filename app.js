var express = require('express');
//加载模板处理模块
var swig = require('swig');
//创建app应用  -> nodejs http.createServer
var app = express();
//加载数据库模块
var mongoose = require('mongoose');
//加载body-parser,用来处理提交的post数据
var bodyParser = require('body-parser');
//加载cookie模块
var Cookies = require('cookies');
//操作数据库
var User = require('./models/user');

//设置静态文件托管(如css,js)
//当用户访问的url以/public开始，那么直接返回对应__dirname + '/public'下的文件
app.use('/public',express.static(__dirname + '/public'));


//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数：模板引擎的名称，同时也是模板文件的后缀,第二个参数表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);

//设置模板文件存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views','./view');

//注册所使用的模板引擎，第一个参数必须是view engine, 第二个参数和app.engine中的一个参数是一致的
app.set('view engine','html');

//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

//设置bodyparser,这样就可以在req上绑定一个body的属性,里面保存的是post过来的数据
app.use(bodyParser.urlencoded({extended:true}));

//设置cookie
app.use(function (req,res,next) {
    req.cookies = new Cookies(req,res);
    //浏览器在发送请求时，会把cookie一起放在header里发过来
    //获得cookie，以便显示在前端以及后端数据库的搜索等
    req.userinfo = {};
    if(req.cookies.get('userinfo')){
        //防止出现不必要的错误
         try {
             req.userinfo = JSON.parse(req.cookies.get('userinfo'));

             //不在cookie里面存放关于管理员的信息，而是每次都通过cookie信息去数据库里判断此人是不是管理员
             User.findOne({
                 username:req.userinfo.username
             }).then(function (userInfo) {
                 //将管理员信息添加在req.userinfo中，方便前端使用
                 req.userinfo.isAdmin = userInfo.isAdmin;
                 // console.log(req.userinfo);
                 next();
                 return;
             });

             // console.log(req.userinfo);
         }catch(e){
             next();
         }
    }else{
        next();
    }

    // console.log( typeof req.cookies.get('userinfo'));

});

//绑定路由
// app.get('/',function (req,res,next) {
//     // res.send('<h1>这是首页</h1>');
//     //读取view目录下的 指定文件，解析并返回给客户端
//     //第一个参数：表示模板的文件，相对于view目录
//     //第二个参数：传递给模板使用的数据
//     res.render('index')
// });

//划分模块，将模块划分为前端模块，后台模块，api模块
app.use('/',require('./routers/main'));
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));

//监听http请求
mongoose.connect('mongodb://localhost:27017/blog',function (err) {
    if(err){
        console.log('数据库链接失败');
    }else{
        console.log('数据库链接成功');
        //当数据库连接成功以后再启动应用
        app.listen(8888);
    }
});

//用户发送http请求 -> url -> 解析路由 -> 找到匹配的规则 -> 执行指定的绑定函数，返回对应内容至用户
//public -> 静态 -> 直接读取指定目录下的文件，返回给用户
//动态 -> 处理业务逻辑，加载模板，解析模板 -> 返回数据给用户