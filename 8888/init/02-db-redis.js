var jw;
var Redis = require('ioredis');

var config = {
    port: 6379,
    host: "127.0.0.1",
    family: 4,           // 4 (IPv4) or 6 (IPv6)
    db: 0
}

module.exports = function (_jw, next) {
    jw = _jw;
    if (!jw.db) { jw.db = {};}
    jw.db.redis = new Redis(config);

    next();
}

