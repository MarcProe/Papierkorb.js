let render = {
    rendercallback: function(err, req, res, template, data, conf, title) {
        req.app.locals.db.collection(conf.db.c_user).find({}).toArray(function(err, users) {
            res.render(template, {err: err, docdata: data, conf: conf, users: users, title: title});
        });
    }
}

module.exports = render;