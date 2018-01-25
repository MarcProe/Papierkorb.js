let render = {
    rendercallback: function(err, req, res, template, data, conf, title) {

        if (!req.session.plain) {
            req.session.plain = {};
        }

        let promiseLoadUsers = new Promise(function(resolve, reject) {
            if (req.session.userlist) {
                resolve();
            } else { //get users from database
                req.app.locals.db.collection(conf.db.c_user).find({}).toArray(function (err, userlistres) {
                    if (err) {
                        reject(err);
                    } else {
                        req.session.userlist = userlistres;
                        resolve();
                    }
                });
            }
        });

        let promiseLoadPartnerlist = new Promise(function(resolve, reject) {
            if(req.session.partnerlist) {
                resolve();
            } else {
                req.app.locals.db.collection(conf.db.c_partner).find({}).toArray(function (err, partnerlistres) {
                    if (err) {
                        reject(err);
                    } else {
                        req.session.partnerlist = partnerlistres;
                        resolve();
                    }
                });
            }
        });

        let promiseLoadTaglist = new Promise(function(resolve, reject) {
            if(req.session.taglist) {
                resolve();
            } else {
                req.app.locals.db.collection(conf.db.c_tag).find({}).toArray(function (err, taglistres) {
                    if (err) {
                        reject(err);
                    } else {
                        req.session.taglist = taglistres;
                        resolve();
                    }
                });
            }
        });

        promiseLoadUsers.then(function() {

            return promiseLoadPartnerlist;

        }).then(function() {

            return promiseLoadTaglist;

        }).then(function() {

            res.render(template, {
                err: err,
                data: data,
                conf: conf,
                title: title,
                session: req.session,
                qhost: req.protocol + '://' + req.get('host')
            });

        }).catch(function(err) {
            console.error(err);
            res.render('error', { error: err } );
        });
    }
};

module.exports = render;
