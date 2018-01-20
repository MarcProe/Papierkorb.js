let express = require('express');
let router = express.Router();

let render = require('../modules/render.js');

let conf = require('config').get('conf');

let inspect = require('eyes').inspector({maxLength: 20000});

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
        query.plaintext = new RegExp(req.body.navsearch.trim(), 'i');
        plainsearch.plaintext = req.body.navsearch.trim();
    }

    //orphan filter has top-prio
    if (req.query.orphan) {
        query = {$or: [ {users: {$exists: false} }, { users: null } ] };
    //if we don't look for orphans, lets see what we are looking for
    } else {

        //db.users.find({'name': {'$regex': '.*sometext.*'}})

        if (req.query.users) {                                                          //if a new search is requested
            query.users = new RegExp(req.query.users);                                //compile regexp rule to query
            ///query.users = {'$regex': '.*' + req.query.users + '.*'};
            req.session.users = req.query.users;                                        //save plain search to session
        } else if (req.body.users) {                                                    //same for POST
            query.users = new RegExp(req.body.users);                                 //compile regexp rule to query
            //query.users = {'$regex': '.*' + req.body.users + '.*'};
            req.session.users = req.body.users;                                         //save plain search to session
        } else if (req.session.users) {                                                 //no new request, session data
            query.users = new RegExp(req.session.users);                              //compile regexp rule to query
            //query.users = {'$regex': '.*' + req.session.users + '.*'};
        }

        if (req.query.tags) {
            query.tags = new RegExp(req.query.tags);
            //query.tags = {'$regex': '.*' + req.query.tags + '.*'};
            req.session.tags = req.query.tags;
        } else if (req.body.tags) {
            query.tags = new RegExp(req.body.tags);
            //query.tags = {'$regex': '.*' + req.body.tags + '.*'};
            req.session.tags = req.body.tags;
        } else if (req.session.tags) {
            query.tags = new RegExp(req.session.tags);
            //query.tags = {'$regex': '.*' + req.session.tags + '.*'};
        }
    }

    inspect(req.query, 'req query');
    inspect(req.body, 'req body');
    inspect(query, 'query');

    req.app.locals.db.collection(conf.db.c_doc).find(query).sort( { docdate: -1 } ).toArray(function(err, result) {
        req.session.query = query;
        render.rendercallback(err, req, res, 'docs', result, conf, 'Dokumentenübersicht');
    });
}

module.exports = router;
