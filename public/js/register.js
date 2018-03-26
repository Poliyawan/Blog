$(document).ready(function() {
	$('#register').on('click',function(event) {
		/* Act on the event */
	    $('.login').hide();
	    // $('.register').css('display', 'block');
	    $('.register').show(); 
	});

	$('#login').on('click',function(event) {
		/* Act on the event */
	    $('.register').hide(); 
	    $('.login').show();
	});
	
	$('.register').find('button').on('click',function () {
	    //通过find找到所有的后代中包含属性为name="username"的元素
		var username = $('.register').find('[name = "username"]').val();
        var password = $('.register').find('[name = "password"]').val();
        var repassword = $('.register').find('[name = "repassword"]').val();

        // console.log(username);
		$.ajax({
			url:'/api/user/register',
			type:'POST',
			dataType:'json',
			data:{
				username:username,
				password:password,
				repassword:repassword
			},
            success:function (data) {
                // console.log(data);
				console.log($('.register div:nth-child(6) > span'));
				$('.register div:nth-child(6) > span').html(data.message);
				if(data.code == 0){
					//两秒后跳到登录页面
					setTimeout(function () {
                        $('.register').hide();
                        $('.login').show();
                    },2000);

				}
            }
		})
    });

	$('.login').find('button').on('click',function(){
		var username = $('.login').find('[name = "username"]').val();
		var password = $('.login').find('[name = "password"]').val();
		$.ajax({
			url:'/api/user/login',
			type:'POST',
			dataType:'json',
			data:{
				username:username,
				password:password
			},
			success:function (data) {
				// console.log(data);
				$('.login div:nth-child(6) > span').html(data.message);
				if(data.code == 0){
                    // setTimeout(function () {
						// $('.login').hide();
						// $('.userinfo').show();
                    //     $('.userinfo').find('#user').html(data.info.username);
                    //     $('.userinfo').find('.info').html("你好，欢迎来到破梨博客");
                    //
                    // },2000)
					//因为已经在模板中判断用户信息和登录页面的逻辑关系，所以这里直接重载页面即可
					window.location.reload();
				}
            }
		})
	});

	$('#logout').on('click',function () {
		$.ajax({
			url:'/api/user/logout',
			success:function (data) {
				if(data.code == 0){
					//后台将cookie处理为空，模板处理逻辑，这里只需要刷新页面即可
					window.location.reload();
				}
            }
		})
    });
});