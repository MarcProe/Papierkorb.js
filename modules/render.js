let render = {
    rendercallback: function(err, req, res, template, data, conf, title) {
        req.app.locals.db.collection(conf.db.c_user).find({}).toArray(function(err, users) {
            req.app.locals.db.collection(conf.db.c_partner).find({}).toArray(function(err, partnerlist) {
                req.app.locals.db.collection(conf.db.c_tag).find({}).toArray(function(err, taglist) {					
					var docdata = {};
					console.log(docdata);
                    res.render(template, {
                        err: err,
                        data: data,
                        conf: conf,
                        users: users,
                        partnerlist: partnerlist,
                        taglist: taglist,
                        title: title,
                        session: req.session
                    });
                });
            });
        });
    }
}

module.exports = render;