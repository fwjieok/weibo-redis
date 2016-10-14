module.exports = function (req, res) {

    res.clearCookie('auth');
    res.redirect('/api/index');
}
