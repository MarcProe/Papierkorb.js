let express = require('express');
let router = express.Router();

let conf = require('config').get('conf');

let inspect = require('eyes').inspector({maxLength: 20000});

router.get('/:version/:func/:docid?/', function (req, res, next) {
    switch (req.params.func) {
        case('end'):
            res.writeHead(200, {
                'message': 'process about to end'
            });
            res.end();
            process.exit(1);
            break;
        case('partners'):
            getpartners(req, res, next).then(function (result) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
            }).catch(function (err) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(err));
            });
            break;
        case('user'):
            getuser(req, res, next).then(function (result) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
            }).catch(function (err) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(err));
            });
            break;
        case('tags'):
            gettags(req, res, next).then(function (result) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
            }).catch(function (err) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(err));
            });
            break;
        case('doc'): {
            getdoc(req, res, next).then(function (result) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
            }).catch(function (err) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(err));
            });
            break;
        }
    }
});

router.post('/:version/:func/:docid?/', function (req, res, next) {
    switch (req.params.func) {
        case 'ocr':
            try {
                req.app.locals.db.collection(conf.db.c_doc).updateOne({_id: req.params.docid}, {$set: req.body}, {upsert: false}, function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        res.send({message: result});
                        res.end();
                    }
                });
            } catch (err) {
                res.writeHead(500, {
                    'message': err
                });
                res.end();
            }
            break;
    }
});

function getpartners(req, res, next) {
    return new Promise(function (resolve, reject) {
        if (req.session.partnerlist) {
            resolve(req.session.partnerlist);
        } else {
            req.app.locals.db.collection(conf.db.c_partner).find({}).toArray(function (err, partnerlistres) {
                if (err) {
                    reject(err);
                } else {
                    req.session.partnerlist = partnerlistres;
                    resolve(partnerlistres);
                }
            });
        }
    });
}

function gettags(req, res, next) {
    return new Promise(function (resolve, reject) {
        if (req.session.taglist) {
            resolve(req.session.taglist);
        } else {
            req.app.locals.db.collection(conf.db.c_tag).find({}).toArray(function (err, taglistres) {
                if (err) {
                    reject(err);
                } else {
                    req.session.taglist = taglistres;
                    resolve(taglistres);
                }
            });
        }
    });
}

function getuser(req, res, next) {
    return new Promise(function (resolve, reject) {
        if (req.session.userlist) {
            resolve(req.session.userlist);
        } else {
            req.app.locals.db.collection(conf.db.c_user).find({}).toArray(function (err, userlistres) {
                if (err) {
                    reject(err);
                } else {
                    req.session.userlist = userlistres;
                    resolve(userlistres);
                }
            });
        }
    });
}

function getdoc(req, res, next) {
    return new Promise(function (resolve, reject) {
        let query = {_id: req.params.docid};
        req.app.locals.db.collection(conf.db.c_doc).find(query).toArray(function (err, doc) {
            if (err) {
                reject(err);
            } else {
                if (doc[0]) {
                    resolve(doc[0]);
                } else {
                    reject({"message": "no result"});
                }
            }
        });
    });
}

module.exports = router;