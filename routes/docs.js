let express = require('express');
let path = require('path');

let router = express.Router();

let render = require('../modules/render.js');

let config = require('config');
let conf = config.get('conf');

router.get('/', function(req, res, next) {
    handle(req, res, next);
});

router.post('/', function(req, res, next) {
    handle(req, res, next);
});

function handle(req, res, next) {

    let query = {};
    let plainsearch = {};

    if(req.body.navsearch) {
        console.log(req.body.navsearch);
        query.plaintext = new RegExp(req.body.navsearch.trim(), 'i');
        plainsearch.plaintext = req.body.navsearch.trim();
    }


    //orphan filter has top-prio
    if (req.query.orphan) {
        query = {$or: [ {users: {$exists: false} }, { users: null } ] };
    //if w don't look for orphans, lets see what we are looking for
    } else {

        if (req.query.users) {
            query.users = new RegExp(req.query.users);
            req.session.users = req.query.users;
            plainsearch.users = req.query.users;
        } else if (req.session.users) {
            query.users = new RegExp(req.session.users);
            plainsearch.users = req.session.users;
        }
    }

    console.log(query);

    req.app.locals.db.collection(conf.db.c_doc).find(query).sort( { docdate: -1 } ).toArray(function(err, result) {
        console.log(query);
        console.log(result);
        let docdata = result;
        req.session.plainsearch = plainsearch;
        req.session.query = query;
        render.rendercallback(err, req, res, 'docs', docdata, conf, 'Dokumentenübersicht');
    });


}



module.exports = router;
