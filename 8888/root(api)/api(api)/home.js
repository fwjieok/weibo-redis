function on_check_is_login(user_id) {
    //根据cookie查到了userid
    if (user_id === null) {
	this.res.redirect("/index.html");		//redirect到首页
	return;
    }

    var key_userid = "userid:" + user_id + ":postid";		
    this.redis.lrange(key_userid, 0, -1).then(on_get_all_postid.bind(this));

}

function on_get_all_postid(postids) {
    if (postids.length <= 0) {
    	this.res.locals.username = this.username;
     	this.res.render("home.hjs");
	return;
    }
    
    var pipeline = this.redis.pipeline();
    for (var i = 0; i < postids.length; i ++) {
	var key_username = "post:postid:" + postids[i] + ":username";
    	var key_content = "post:postid:" + postids[i] + ":content";
    	var key_time    = "post:postid:" + postids[i] + ":time";;
    	pipeline.mget(key_username, key_content, key_time);
    }

    pipeline.exec(on_response_with_all_posts.bind(this));
}

function on_response_with_all_posts(err, result) {
    if (err || result.length <= 0) {
    	this.res.locals.username = this.username;
    	this.res.render("home.hjs");
	return;
    }
    
    var posts = [];
    for (var i = 0; i < result.length; i ++) {
    	var post  = {};
	post.username = result[i][1][0];
    	post.content  = result[i][1][1];
    	post.time     = result[i][1][2];

	this.username = post.username;
	
    	posts.push(post);
    }
    
    this.res.locals.username = this.username;
    this.res.locals.posts = posts;
    this.res.render("home.hjs");
}


module.exports = function (req, res) {
    var username = req.query.u;

    var rec = {
	req : req,
	res : res,
	username : username,
	redis : req.jw.db.redis
    }

    //根据cookie检查是否已经登录(cookie未过期)
    if (req.cookies.auth != null) {
	var key_auth  = "auth:" + req.cookies.auth;
	req.jw.db.redis.get(key_auth).then(on_check_is_login.bind(rec));
    } else {
	res.redirect("/index.html");
    }
}
