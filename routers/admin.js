var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Category = require('../models/category');
var Content = require('../models/content');
router.use(function (req,res,next) {
    // console.log(req.userinfo);
   if(!req.userinfo.isAdmin){
       res.send('对不起，只有管理员才能进入后台管理');
       return;
   }
   next();
});

//首页
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userinfo:req.userinfo
    });
});

//用户管理
router.get('/user',function (req,res,next) {
    //从数据库中找到所有的用户信息，并赋给前端使用
    /*
       分页功能实现
       limit(Number):限制从数据库中取出多少条
       skip(Number):从头开始算，跳过几条
       count():统计数据库里有多少条信息

       每页显示两条：
       1 显示1-2，skip(0) :(1-1)*2
       2 显示2-3，skip(2)  (2-1)*2
     */
    // console.log(req);
    var page = Number(req.query.page || 1);
    var number = 2;
    var pages = 0;

    User.count().then(function (count) {
        // console.log(count)
        //向上取整，计算存在的页数
        pages = Math.ceil(count/number);
        //用户传过来的页数不能多于存在的页数
        page = Math.min(page,pages);
        page = Math.max(page,1);

        User.find().limit(number).skip((page-1)*number).then(function (users) {
            // console.log(users);
            res.render('admin/user_index',{
                userinfo:req.userinfo,
                users:users,
                page:page,
                pages:pages
            });
        });
    });
});

//分类首页
router.get('/category',function (req,res,next) {
    var page = Number(req.query.page || 1);
    var number = 2;
    var pages = 0;

    Category.count().then(function (count) {
        // console.log(count)
        //向上取整，计算存在的页数
        pages = Math.ceil(count/number);
        //用户传过来的页数不能多于存在的页数
        page = Math.min(page,pages);
        page = Math.max(page,1);
        /*
         id是有时间戳生成的，越先生成的，时间戳越大
         -1：按降序排列
         1：按升序排列
         */
        Category.find().sort({_id:-1}).limit(number).skip((page-1)*number).then(function (categories) {
            // console.log(users);
            res.render('admin/category_index',{
                userinfo:req.userinfo,
                categories:categories,
                page:page,
                pages:pages
            });
        });
    });
});


//添加分类
router.get('/category/add',function (req,res,next) {
    res.render('admin/category_add',{
        userinfo:req.userinfo
    })
});
//处理分类表单提交的数据
router.post('/category/add',function (req,res) {
    // console.log(req.body);
    var name = req.body.name;
    if (name == ''){
        res.render('admin/error',{
            userinfo:req.userinfo,
            message:'分类名称不能为空'
        });
        //这里必须return，如果不退出该函数的话，会在render后再render，报错
        // return;
    }
    //判断数据库中是否包含相同的分类
    else{
        Category.findOne({
            name:name
        }).then(function (info) {
            if(info){
                res.render('admin/error',{
                    userinfo:req.userinfo,
                    message:'该分类已经存在'
                });
                //这里一定要使用return，把reject返回出去，这样下一个then才不会执行
                return Promise.reject();
            }
            else{
                new Category({name:name}).save()
            }
        }).then(function () {
            res.render('admin/success',{
                userinfo:req.userinfo,
                message:'分类添加成功',
                url:'/admin/category'
            })
        })
    }
});

//修改分类
router.get('/category/edit',function (req,res) {
    // var name = req.query.name;
    res.render('admin/category_edit',{
        userinfo:req.userinfo
    })
});
//处理修改分类的数据
router.post('/category/edit',function (req,res) {
    var name = req.query.name;
    var newname = req.body.name;
    Category.update({
        name:name
    },{
      $set:{name:newname}
    }).then(function (info) {
        if(info.ok){
            res.render('admin/success',{
                userinfo:req.userinfo,
                message:'修改成功',
                url:'/admin/category'
            })
        }
        else{
            res.render('admin/error',{
                userinfo:req.userinfo,
                message:'修改失败'

            })
        }
    })
});

//删除分类
router.get('/category/delete',function (req,res,next) {
    var name = req.query.name;
    // res.send(name);
    Category.remove({
        name:name
    }).then(function (info) {
        //删除成功后重新渲染页面
        if(info.ok){
            var page = Number(req.query.page || 1);
            var number = 2;
            var pages = 0;

            Category.count().then(function (count) {
                // console.log(count)
                //向上取整，计算存在的页数
                pages = Math.ceil(count/number);
                //用户传过来的页数不能多于存在的页数
                page = Math.min(page,pages);
                page = Math.max(page,1);

                Category.find().limit(number).skip((page-1)*number).then(function (categories) {
                    // console.log(users);
                    res.render('admin/category_index',{
                        userinfo:req.userinfo,
                        categories:categories,
                        page:page,
                        pages:pages
                    });
                });
            });
        }
    })
});

//内容管理首页
router.get('/content',function (req,res) {
    var page = Number(req.query.page || 1);
    var number = 2;
    var pages = 0;

    Content.count().then(function (count) {
        // console.log(count)
        //向上取整，计算存在的页数
        pages = Math.ceil(count/number);
        //用户传过来的页数不能多于存在的页数
        page = Math.min(page,pages);
        page = Math.max(page,1);

        //populate是找到该关联的字段，然后在相关联的表中(在相对应的表结构中定义)
        Content.find().sort({_id:-1}).populate(['category','user']).limit(number).skip((page-1)*number).then(function (contents) {
             // console.log(contents);
            res.render('admin/content_index',{
                userinfo:req.userinfo,
                contents:contents,
                page:page,
                pages:pages
            });
        });
    });
});

//添加内容
router.get('/content/add',function (req,res) {
    //从数据库中读取分类信息，在option里循环
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin/content_add',{
            userinfo:req.userinfo,
            categories:categories
        })
    });

});

router.post('/content/add',function (req,res) {
   // console.log(req.body);
    if(req.body.title == ''){
        res.render('admin/error',{
            userinfo:req.userinfo,
            message:"标题不能为空"
        })
    }
    else if (req.body.content == ''){
        res.render('admin/error',{
            userinfo:req.userinfo,
            message:'内容不能为空'
        })
    }
    else{
        //保存在数据库中
        return new Content({
            category:req.body.category,
            title:req.body.title,
            user:req.userinfo.id.toString(),
            description:req.body.description,
            content:req.body.content
        }).save().then(function (info) {
           if(info){
               res.render('admin/success',{
                   userinfo:req.userinfo,
                   message:'内容保存成功',
                   url:'/admin/content'
               })
           }
        })
    }
});

//删除内容
router.get('/content/delete',function (req,res) {
   var id = req.query.id;
   Content.remove({_id:id}).then(function (info) {
       var page = Number(req.query.page || 1);
       var number = 2;
       var pages = 0;
       Content.count().then(function (count) {
           // console.log(count)
           //向上取整，计算存在的页数
           pages = Math.ceil(count/number);
           //用户传过来的页数不能多于存在的页数
           page = Math.min(page,pages);
           page = Math.max(page,1);

           //populate是找到该关联的字段，然后在相关联的表中(在相对应的表结构中定义)
           Content.find().sort({_id:-1}).populate('category').limit(number).skip((page-1)*number).then(function (contents) {
               // console.log(contents);
               res.render('admin/content_index',{
                   userinfo:req.userinfo,
                   contents:contents,
                   page:page,
                   pages:pages
               });
           });
       });
   })
});

//修改内容
router.get('/content/edit',function (req,res) {
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin/content_edit',{
            userinfo:req.userinfo,
            categories:categories
        })
    });
});

router.post('/content/edit',function (req,res) {
    var id = req.query.id;
    Content.update({_id:id},{
        $set:{
            category:req.body.category,
            title:req.body.title,
            description:req.body.description,
            content:req.body.content
        }
    }).then(function(info){
        if(info.ok){
            res.render('admin/success',{
                userinfo:req.userinfo,
                message:'修改成功',
                url:'/admin/content'
            })
        }
    })
});
//把值传回去
module.exports = router;