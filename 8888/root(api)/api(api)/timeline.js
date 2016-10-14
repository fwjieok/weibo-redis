/*
function on_get_new_user_list(data) {
    // var pipeline = this.redis.pipeline();
    // for (var i = 1; i <= data.length; i ++) {
    // 	var key = "user:userid:" + i + ":username";
    // 	pipeline.get(key);
    // }
    // pipeline.exec(on_response_with_lastest_users.bind(this));

    
}
*/

function on_response_with_lastest_users(data) {
    if (data.length <= 0) {
	this.res.render("timeline.hjs");
	return;
    }

    var lastest_users = [];
    for (var i = 0; i < data.length; i ++) {
    	var user = {};
    	user.username = data[i];
    	lastest_users.push(user);
    }

    this.res.locals.lastest_users = lastest_users;
    this.res.render('timeline.hjs');
}


module.exports = function (req, res) {

    var rec = {
	req: req,
	res: res,
	redis: req.jw.db.redis,
    }

    //select newuserlist
    req.jw.db.redis.sort("newuserlist", "get", "user:userid:*:username", "desc", "limit", 0, -1).then(on_response_with_lastest_users.bind(rec));
}
