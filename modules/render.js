let render = {
    rendercallback: function(err, req, res, template, data, conf, title) {

        let promiseLoadUsers = new Promise(function(resolve, reject) {
            if(req.session.userlist) { //get users from session
                console.log('user: session');
                resolve();
            } else { //get users from database
                req.app.locals.db.collection(conf.db.c_user).find({}).toArray(function (err, userlistres) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('user: db');
                        req.session.userlist = userlistres;
                        resolve();
                    }
                });
            }
        });

        let promiseLoadPartnerlist = new Promise(function(resolve, reject) {
            if(req.session.partnerlist) {
                console.log('partner: session');
                resolve();
            } else {
                req.app.locals.db.collection(conf.db.c_partner).find({}).toArray(function (err, partnerlistres) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('partner: db');
                        req.session.partnerlist = partnerlistres;
                        resolve();
                    }
                });
            }
        });

        let promiseLoadTaglist = new Promise(function(resolve, reject) {
            if(req.session.taglist) {
                console.log('tag: session');
                resolve();
            } else {
                req.app.locals.db.collection(conf.db.c_tag).find({}).toArray(function (err, taglistres) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('tag: db');
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
                session: req.session
            });

        }).catch(function(err) {
            console.log(err);
            res.render('error', { error: err } );
        });
    }
};

module.exports = render;
