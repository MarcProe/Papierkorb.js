let render = {
    rendercallback: function(err, req, res, template, data, conf, title) {
        req.app.locals.db.collection(conf.db.c_user).find({}).toArray(function(err, users) {
            req.app.locals.db.collection(conf.db.c_partner).find({}).toArray(function(err, partnerlist) {
                req.app.locals.db.collection(conf.db.c_tag).find({}).toArray(function(err, taglist) {					
					var data = {
                        err: err,
                        docdata: data,
                        conf: conf,
                        users: users,
                        partnerlist: partnerlist,
                        taglist: taglist,
                        title: title
                    };
					console.log(data);
                    res.render(template, data);
                });
            });
        });
    }
}

module.exports = render;