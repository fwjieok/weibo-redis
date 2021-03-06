
var uuid = require('node-uuid');

function on_register_new_user(user_id) {
    if (user_id != null) {
	this.uuid_value = uuid.v4();

	this.redis.multi();
	var key1   = "user:userid:" + user_id + ":username";
	var key2   = "user:userid:" + user_id + ":password";
	var key3   = "user:userid:" + user_id + ":auth";
	this.redis.mset(key1, this.username, key2, this.password, key3, this.uuid_value);

	var key = "user:username:" + this.username + ":userid";
	this.redis.set(key, user_id);

	var key_auth = "auth:" + this.uuid_value;
	this.redis.set(key_auth, user_id);

	//Secondary indexing
	//save the lastest 50 users
	this.redis.lpush("newuserlist", user_id);
	this.redis.ltrim("newuserlist", 0, 49);

	this.redis.exec(on_register_success.bind(this));

    } else {
	this.res.end("服务器错误,注册失败");
    }

}

function on_register_success() {
    this.res.cookie("auth", this.uuid_value, { maxAge: 3*60*1000 });
    this.res.redirect("/api/home?u=" + this.username);
    //this.res.render("home.hjs");
}

module.exports = function (req, res) {
    
    var username = req.body.username;
    var password = req.body.password;
    if (username.trim() == "" || password.trim() == "") {
	res.end("用户名和密码不能为空");
    }

    var rec = {
	req : req,
	res : res,
	redis: req.jw.db.redis,
	username : req.body.username,
	password : req.body.password,
	uuid_value: ""
    }

    //根据用户名查userid来判断用户名是否已经被注册
    var key = "user:username:" + req.body.username + ":userid";  
    req.jw.db.redis.get(key).then(function (user_id) {
	if (user_id == null) {
	    req.jw.db.redis.incr("global:next_user_id").then(on_register_new_user.bind(rec));
	} else {
	    res.end("用户名已经被注册!");
	}
    });

}
