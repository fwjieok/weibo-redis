
var uuid = require('node-uuid');

function on_validate_login(result) {
    var password = result[0];
    var auth     = result[1];

    if (password == null) {
	this.res.end("服务器错误");
    }

    if (password === this.password) {
	//设置cookie,过期时间为3分钟
	this.res.cookie("auth", auth, { maxAge: 3*60*1000 });
	this.res.redirect("/api/home?u=" + this.username);
	//this.res.render("home.hjs");
    } else {
	this.res.redirect("/");
    }
}


module.exports = function (req, res) {

    var rec = {
	req : req,
	res : res,
	redis : req.jw.db.redis,
	username : req.body.username,
	password : req.body.password
    }
    
    var key = "user:username:" + req.body.username + ":userid";
    req.jw.db.redis.get(key).then(function(user_id) {
	if (user_id != null) {
	    var key_password = "user:userid:" + user_id + ":password";
	    var key_auth     = "user:userid:" + user_id + ":auth";
	    req.jw.db.redis.mget(key_password, key_auth).then(on_validate_login.bind(rec));
	} else {
	    res.redirect("/");
	}
    });
}
