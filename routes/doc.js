let express = require('express');

let router = express.Router();

let fs = require('fs');
let padStart = require('pad-start');

let render = require('../modules/render.js');

let config = require('config');
let conf = config.get('conf');

const months = ['Januar','Februar','März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

router.get('/:docid/:func?/:genid?', function(req, res, next) {
    console.log(req.params.docid);
    console.log(req.params);

    switch (req.params.func) {
        case 'preview':
            preview(req, res, next);
            break;
        case 'thumb':
            thumb(req, res, next);
            break;
        case 'update':
            update(req, res, next);
            break;
        default:
            update(req, res, next);
            break;
    }
});

router.post('/:docid/:func?/:genid?', function(req, res, next) {
    switch (req.params.func) {
        case 'update':
            update(req, res, next);
            break;
        default:
            view(req, res, next);
            break;
    }
});

function preview(req, res, next) {
    let id = req.params.genid ? req.params.genid : 1;
    let img = fs.readFileSync(conf.doc.imagepath + req.params.docid + '.' + id + '.png');
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');
}

function thumb(req, res, next) {
    let id = req.params.genid ? req.params.genid : 1;
    let img = fs.readFileSync(conf.doc.imagepath + req.params.docid + '.' + id + '.thumb.png');
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');
}

/*
function view(req, res, next) {

    req.app.locals.db.collection(conf.db.c_doc).findOne( {_id: req.params.docid}, function(err, result) {
        if (err || !result || !result._id) {
            console.log(err);
            render.rendercallback(err, req, res, 'error', result, conf);
        } else {
            render.rendercallback(err, req, res, 'doc', result, conf, result.subject ? result.subject : result._id);
        }
    });
}
*/

function update(req, res, next) {
    if(req.params.genid === "true") {  //execute update
        let docdata = {
            $set: {
                subject: req.body.subject,
                users: req.body.users,
                docdate: req.body.docdate,
                partner: req.body.partner
            }
        };

        req.app.locals.db.collection(conf.db.c_doc).updateOne({_id: req.params.docid}, docdata, { upsert : true },  function(err, result) {
            if (err) throw err;

            res.writeHead(302, {
                'Location': '/doc/' + req.params.docid + '/update/'
            });
            res.end();
        });

    } else { //show update form
        console.log('show update');

        req.app.locals.db.collection(conf.db.c_doc).findOne( {_id: req.params.docid}, function(err, result) {

            if(!result) {
                result = {};
            }
            if(!result.users) {
                result.users = [];
            }

            if(!result.docdate && result.plaintext) {
                //versuche das Datum zu finden
                let regex = /([\d]{1,2})\.\s?([\d]{1,2}|[\w]{3,9})\.?\s?(\d{4}|\d{2})/;
                let dateregex = result.plaintext[0].match(regex);
                if (dateregex) {

                    let day = dateregex[1];
                    let month = dateregex[2];
                    let year = dateregex[3];

                    if (isNaN(month)) {
                        month = months.indexOf(month) + 1;
                    }
                    console.log(result.plaintext.toString());
                    result.docdate = padStart(day, 2, '0') + '-' + padStart(month, 2, '0') + '-' + padStart(year, 4, '20')  ;
                    result.founddate = true;
                    console.log(result.docdate);
                }
            }

            let bestpartner = {"name": "", "score": "0"};

            if(!result.partner && result.plaintext) {
                req.app.locals.db.collection(conf.db.c_partner).find({}).toArray(function(err, partners) {
                    let score = 0;
                    partners.forEach(function(partner) {
                        if(partner.search) {
                            partner.search.forEach(function(search) {
                                let partnerfind = result.plaintext[0].match(new RegExp(search));
                                console.log(partner.name + ' - ' + search + ' - ' + partnerfind);
                                if(partnerfind) {
                                    score++;
                                }
                            });
                            if(score > bestpartner.score) {
                                bestpartner.name = partner.name;
                                bestpartner.score = score;
                                console.log('New best Partner: ' + partner.name);
                            }
                        }
                    });
                    console.log(bestpartner);
                    result.partner = bestpartner.name;
                    result.foundpartner = true;
                    preparerender(req, res, next, result)

                });
            } else {
                preparerender(req, res, next, result)
            }
        });
    }
}

function preparerender(req, res, next, result) {
    req.app.locals.db.collection(conf.db.c_partner).find({}).toArray(function(err, partnerlist) {
        result.partnerlist = partnerlist;
        render.rendercallback(err, req, res, 'doc_form', result, conf, result.subject ? result.subject : result._id)

    });
}

module.exports = router;
