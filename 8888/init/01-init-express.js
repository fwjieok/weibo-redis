var bodyParser   = require("body-parser");
var cookieParser = require("cookie-parser");

module.exports = function (jw, next) {
	jw.app.use(bodyParser.urlencoded({ extended: true }));
	jw.app.use(bodyParser.json());
	jw.app.use(cookieParser());
	//jw.app.disable("view cache");
	jw.app.set('view engine', 'hjs');
	next();
}