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

    //initialize filter
    //if(!req.session.users) req.session.users = new RegExp('.*');
    //if(!req.session.partner) req.session.partner = /.*/;
    //if(!req.session.tags) req.session.tags = /.*/;
    //if(!req.session.docdate) req.session.docdate = /.*/;
    //if(!req.session.fulltext) req.session.fulltext = /.*/;

    let query = {};
    let plainsearch = {};
    //query.users = {};
    //query.tags = {};
    //query.partner = {};

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

        /*if(req.query.partner) {
            query.partner = new RegExp(req.query.partner);
            req.session.partner = new RegExp(req.query.partner);
        } else if (req.session.partner) {
            query.partner = req.session.partner;
        }

        if(req.query.tags) {
            query.tags = new RegExp(req.query.tags);
            req.session.tags = new RegExp(req.query.tags);
        } else if (req.session.tags) {
            query.tags = req.session.tags;
        }*/
    }

    console.log(query);

    req.app.locals.db.collection(conf.db.c_doc).find(query).sort( { docdate: -1 } ).toArray(function(err, result) {
        console.log(query);
        console.log(result);
        let docdata = result;
        docdata.plainsearch = plainsearch;
        docdata.query = query;
        render.rendercallback(err, req, res, 'docs', docdata, conf, 'Dokumentenübersicht');
    });


}



module.exports = router;
