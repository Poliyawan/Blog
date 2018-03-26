//当前第几页
var page = 1;
//一共多少页
var pages = 0;
//每页显示多少条评论
var perpage = 2;
//当前显示的评论始末序号
var start = 0;
var end = 0;
//把评论相关的信息保存起来，方便在各函数中使用
var renderdata = [];
//点击上一页和下一页
$('.page a').eq(0).on('click',function () {
   page -= 1;
   //页数改变以后，重新渲染评论模块
   renderCom();
});

$('.page a').eq(1).on('click',function () {
    page += 1;
    renderCom();
});

//提交评论的数据
    $('#comment').on('click',function () {
        $.ajax({
            url:'/api/comment',
            type:'POST',
            dataType:'json',
            data:{
                comment:$('#content').val(),
                comtime:new Date(),
                comuser:$('#comuser').html(),
                contentid:$("#contentid").val()
            },
            success:function (data) {
                // console.log(data);
                if(data.code == 0){
                    renderdata = data;
                    renderCom();
                }
            }
        })
    });

    //显示已有的评论
    $.ajax({
        url:'/api/comment',
        type:'GET',
        dataType:'json',
        data:{
            contentid:$("#contentid").val()
        },
        success:function (data) {
            // console.log(data);
            if(data.code == 0){
                renderdata = data;
               renderCom();
            }
        }
    });

    function transformTime(time) {
        var date = new Date(time);
        return date.getFullYear() +'.'+(date.getMonth()+1)+'.'+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    };

    function renderCom() {
        pages = Math.ceil(renderdata.comments.length/perpage);
        page = Math.max(page,1);
        page = Math.min(page,pages);
        $('.page span:nth-child(2)').html(page+'/'+pages);
        start = (page-1) * perpage;
        end = (start + perpage)> renderdata.comments.length?renderdata.comments.length:(start + perpage);
        // console.log(st'art,end);
        $('.think').html('');
        for(var i = start; i < end; i++){
            var html = '';
            html += '<div class="liuyan"> <span>'+renderdata.comments[i].comuser+'</span> <span>'+transformTime(renderdata.comments[i].comtime)+'</span><p>'+renderdata.comments[i].comment+'</p>';
            $('.think').append(html);
        }
    }
