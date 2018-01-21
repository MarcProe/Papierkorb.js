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
    let plain = {};

    let flags = 'i';

    if(req.body.navsearch) {
        query.plaintext = new RegExp(req.body.navsearch.trim(), 'i');
        plain.plaintext = req.body.navsearch.trim();
    }

    //orphan filter has top-prio
    if (req.query.orphan) {

        plain.orphan = req.query.orphan;

        query.$or = [];

        let searchExists = {};
        searchExists[req.query.orphan] = {$exists: false};
        query.$or.push(searchExists);

        let searchNull = {};
        searchNull[req.query.orphan] = null;
        query.$or.push(searchNull);

        let searchEmpty = {};
        searchEmpty[req.query.orphan] = '';
        query.$or.push(searchEmpty);


        if (req.query.orphan === 'tags' || req.query.orphan === 'users') {
            let searchEmtpyArray = {};
            searchEmtpyArray[req.query.orphan + '.0'] = {$exists: false};
            query.$or.push(searchEmtpyArray);
        }

        //if we don't look for orphans, lets see what we are looking for. DRY violation incoming!
    } else {

        if (req.query.delusers || req.body.delusers) {                                   //check if we don't want users
            delete req.session.users;
        } else if (req.query.users) {                                                   //if a new search is requested
            query.users = new RegExp(req.query.users, flags);                           //compile regexp rule to query
            plain.users = req.query.users;
            req.session.users = req.query.users;                                        //save plain search to session
        } else if (req.body.users) {                                                    //same for POST, comment too s
            query.users = new RegExp(req.body.users, flags);                            //compile regexp rule to query
            plain.users = req.body.users;
            req.session.users = req.body.users;                                         //save plain search to session
        } else if (req.session.users) {                                                 //no new request, session data
            query.users = new RegExp(req.session.users, flags);                         //compile regexp rule to query
            plain.users = req.session.users;
        }

        if (req.query.deltags || req.body.deltags) {
            delete req.session.tags;
        } else if (req.query.tags && req.query.tags !== '') {
            query.tags = new RegExp(req.query.tags, flags);
            plain.tags = req.query.tags;
            req.session.tags = req.query.tags;
        } else if (req.body.tags && req.body.tags !== '') {
            query.tags = new RegExp(req.body.tags, flags);
            plain.tags = req.body.tags;
            req.session.tags = req.body.tags;
        } else if (req.session.tags && req.session.tags !== '') {
            query.tags = new RegExp(req.session.tags, flags);
            plain.tags = req.session.tags;
        }

        if (req.query.delpartner || req.body.delpartner) {
            delete req.session.partner;
        } else if (req.query.partner && req.query.partner !== '') {
            query.partner = new RegExp(req.query.partner, flags);
            plain.partner = req.query.partner;
            req.session.partner = req.query.partner;
        } else if (req.body.partner && req.body.partner !== '') {
            query.partner = new RegExp(req.body.partner, flags);
            plain.partner = req.body.partner;
            req.session.partner = req.body.partner;
        } else if (req.session.partner && req.session.partner !== '') {
            query.partner = new RegExp(req.session.partner, flags);
            plain.partner = req.session.partner;
        }

        /*
        if(req.query.deldocdate || req.body.deldocdate) {
            delete req.session.docdate;
        } else if (req.query.docdate && req.query.docdate !== '') {
            query.docdate = new RegExp(req.query.docdate, flags);
            query.docdate = {};
            //query.docdate.$gte = ISODate

            //{
            //    $gte: ISODate("2010-04-29T00:00:00.000Z"),
            //        $lt: ISODate("2010-05-01T00:00:00.000Z")
            //}


            plain.docdate = req.query.docdate;
            req.session.docdate = req.query.docdate;
        } else if (req.body.docdate && req.body.docdate !== '') {
            query.docdate = new RegExp(req.body.docdate, flags);
            plain.docdate = req.body.docdate;
            req.session.docdate = req.body.docdate;
        } else if (req.session.docdate && req.session.docdate !== '') {
            query.docdate = new RegExp(req.session.docdate, flags);
            plain.docdate = req.session.docdate;
        }*/
    }

    inspect(req.query, 'req query');
    inspect(req.body, 'req body');
    inspect(query, 'query');

    req.app.locals.db.collection(conf.db.c_doc).find(query).sort( { docdate: -1 } ).toArray(function(err, result) {
        req.session.query = query;
        req.session.plain = plain;
        render.rendercallback(err, req, res, 'docs', result, conf, 'Dokumentenübersicht');
    });
}

module.exports = router;
