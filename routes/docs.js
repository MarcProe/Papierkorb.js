let express = require('express');
let path = require('path');

let router = express.Router();

let render = require('../modules/render.js');

let config = require('config');
let conf = config.get('conf');

router.get('/', function(req, res, next) {
    let query = {};

    if (req.query.user) {
        query.users = new RegExp(req.query.user);
        req.session.user = req.query.user;
    } else if (req.session.user) {
        query.users = new RegExp(req.session.user);
    }

    req.app.locals.db.collection(conf.db.c_doc).find(query).sort( { docdate: -1 } ).toArray(function(err, result) {
        console.log(query);
        console.log(result);
        let docdata = result;
        docdata.query = query;
        render.rendercallback(err, req, res, 'docs', docdata, conf, 'Dokumentenübersicht');
    });


});

module.exports = router;
