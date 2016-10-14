Date.prototype.Format = function (fmt) {
    var o = {
	"M+": this.getMonth() + 1, //月份
	"d+": this.getDate(), //日
	"h+": this.getHours(), //小时
	"m+": this.getMinutes(), //分
	"s+": this.getSeconds(), //秒
	"q+": Math.floor((this.getMonth() + 3) / 3), //季度
	"S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) {
	if (new RegExp("(" + k + ")").test(fmt)) {
	    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	}
    }
    return fmt;
}


function on_get_userinfo(user_id) {
    //用户未登录
    if (user_id == null) {
	this.res.redirect("/");
    }

    this.userid = user_id;
    var key = "user:userid:" + user_id + ":username";
    this.redis.get(key).then(on_get_new_postid.bind(this));
}

function on_get_new_postid(username) {
    this.username = username;
    this.redis.incr("global:postid").then(on_publish_a_message.bind(this));
}

function on_publish_a_message(post_id) {	

    if (post_id == null) {
	this.res.end("服务器错误");
    }

    var key1 = "post:postid:" + post_id + ":userid";
    var key2 = "post:postid:" + post_id + ":username";
    var key3 = "post:postid:" + post_id + ":content";
    var key4 = "post:postid:" + post_id + ":time";

    var now = new Date().Format("yyyy-MM-dd hh:mm:ss");
    
    this.redis.mset(key1, this.userid,
		    key2, this.username,
		    key3, this.content,
		    key4, now);

    //存储用户发布的post id
    var key_userid = "userid:" + this.userid + ":postid";
    this.redis.lpush(key_userid, post_id);

    this.res.redirect("home?u=" + this.username);
}


module.exports = function (req, res) {
    var content = req.body.status;		//发表的内容

    var rec = {
	req : req,
	res : res,
	userid : "",
	username : "",
	content : content,
	redis : req.jw.db.redis
    }

    //根据cookie查询是否登录
    var key_auth  = "auth:" + req.cookies.auth;
    req.jw.db.redis.get(key_auth).then(on_get_userinfo.bind(rec));
}
