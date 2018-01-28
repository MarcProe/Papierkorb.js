let express = require('express');
let router = express.Router();

let config = require('config');
let conf = config.get('conf');

let render = require('../modules/render.js');

let inspect = require('eyes').inspector({maxLength: 20000});


router.get('/:filename?/:func?', function (req, res, next) {
    handle(req, res, next);
});

router.post('/:filename?/:func?', function (req, res, next) {
    handle(req, res, next);
});

function handle(req, res, next) {
    switch (req.params.func) {
        default:
            let uq = req.session.users;
            if (!uq) {
                uq = {$exists: true};       //match any user
            }
            let query = [
                {
                    $match: {
                        users: uq
                    }
                },
                {$unwind: "$partner"},
                {
                    $group: {
                        _id: '$partner',
                        count: {$sum: 1}
                    }
                },
                {
                    $lookup: {
                        from: "partner",
                        localField: "_id",
                        foreignField: "_id",
                        as: "partner"
                    }
                },
                {$unwind: "$partner"},
                {
                    $project: {
                        "_id": 1,
                        "name": "$partner.name",
                        "count": 1
                    }
                },
                {$sort: {_id: 1}},
                {$limit: 100}
            ];

            console.log(req.session.users);

            req.app.locals.db.collection(conf.db.c_doc).aggregate(query).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                }
                console.log('WAA!');
                console.log(err);
                inspect(result);
                render.rendercallback(null, req, res, 'partners', result, conf, 'Partner');
            });
            break;
    }
}

module.exports = router;