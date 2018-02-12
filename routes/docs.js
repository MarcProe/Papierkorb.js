let express = require('express');
let router = express.Router();

let render = require('../modules/render.js');
let sq = require('../modules/searchquery.js');

let conf = require('config').get('conf');

let inspect = require('eyes').inspector({maxLength: 20000});

router.get('/', function(req, res, next) {
    handle(req, res, next);
});

router.post('/', function(req, res, next) {
    handle(req, res, next);
});

function handle(req, res, next) {

    let query = {};             //query to be passed to the database
    let plain = {};             //plaintext query to show the user
    let flags = 'i';            //regex flags used

    if(req.body.navsearch) {
        let plainQuery = new RegExp(req.body.navsearch.trim(), 'i');

        query.$or = [];
        query.$or.push({plaintext: plainQuery});
        query.$or.push({subject: plainQuery});

        plain.plaintext = req.body.navsearch.trim();
    }

    //orphan filter has top-priority
    if (req.query.orphan) {

        plain.orphan = req.query.orphan;

        query.$or = [];

        let searchExists = {};
        searchExists[req.query.orphan] = {$exists: false};
        query.$or.push(searchExists);

        //should never happen
        let searchNull = {};
        searchNull[req.query.orphan] = null;
        query.$or.push(searchNull);

        //should never happen
        let searchEmpty = {};
        searchEmpty[req.query.orphan] = '';
        query.$or.push(searchEmpty);

        //tags and users are array, so we need to search for empty array as well
        if (req.query.orphan === 'tags' || req.query.orphan === 'users') {
            let searchEmtpyArray = {};
            searchEmtpyArray[req.query.orphan + '.0'] = {$exists: false};
            query.$or.push(searchEmtpyArray);
        }

        //if we don't look for orphans, lets see what we are looking for. DRY violation incoming!
    } else {
        sq.users(req, query, plain, flags);
        sq.tags(req, query, plain, flags);
        sq.partner(req, query, plain, flags);
        sq.docdate(req, query, plain);
    }

    inspect(req.query, 'req query');
    inspect(req.body, 'req body');
    inspect(query, 'query');

    req.app.locals.db.collection(conf.db.c_doc).find(query).limit(100).sort({docdate: -1}).toArray(function (err, result) {
        req.session.query = query;
        req.session.plain = plain;
        render.rendercallback(err, req, res, 'docs', result, conf, 'Dokumentenübersicht');
    });
}

module.exports = router;
