let express = require('express');

let router = express.Router();

let fs = require('fs');
let padStart = require('pad-start');

let render = require('../modules/render.js');
let editpre = require('../modules/editpreview.js');

let config = require('config');
let conf = config.get('conf');

const months = ['Januar','Februar','März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

router.get('/:docid/:func?/:genid?/', function(req, res, next) {
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
        case 'edit':
            editpre.edit(res, req.params.genid, req.params.docid, req.query.preview, req.query.degrees);
            break;
        case 'move':
            movepage(res, req.params.docid, req.params.genid, req.query.page);
            break;
        case 'delete':
            console.log(req.params.genid);
            deletepage(req, res, req.params.docid, req.params.genid, req.query.previews);
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

function movepage(res, docid, direction, page) {
    console.log('Starting 1')
    let filetemp = conf.doc.imagepath + docid + '.temp.png';
    let file1 = conf.doc.imagepath + docid + '.' + page + '.png';
    let file2 = '';

    console.log(filetemp);
    console.log(file1);
    console.log(direction);

    if(direction === 'up') {
        file2 = conf.doc.imagepath + docid + '.' + (parseInt(page) - 1) + '.png';
    } else {
        file2 = conf.doc.imagepath + docid + '.' + (parseInt(page) + 1) + '.png';
    }

    console.log(file2);

    fs.renameSync(file2, filetemp);
    fs.renameSync(file1, file2);
    fs.renameSync(filetemp, file1);

    res.writeHead(302, {
        'Location': '/doc/' +docid + '/update/'
    });
    res.end();
}

function deletepage(req, res, docid, page, maxpages ) {
    //delete page
    fs.unlinkSync(conf.doc.imagepath + docid + '.' + page + '.png');

    //move all lower pages
    for(let i = parseInt(page); i < maxpages; i++) {
        let filenew = conf.doc.imagepath + docid + '.' + i + '.png';
        let fileold = conf.doc.imagepath + docid + '.' + (i + 1) + '.png';
        console.log('I would move page '+fileold+' to page '+filenew);
        fs.renameSync(fileold, filenew);
    }

    //update database preview field
    let previews = parseInt(maxpages) - 1;
    let docdata = {
        $set: {
            previews: previews
        }
    };
    req.app.locals.db.collection(conf.db.c_doc).updateOne({_id: docid}, docdata, { upsert : true },  function(err, result) {
        if (err) throw err;

        res.writeHead(302, {
            'Location': '/doc/' +docid + '/update/'
        });
        res.end();
    });


}

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

function update(req, res, next) {

    if(req.params.genid === "true") {  //execute update

        let tags = [];
        let dbtags = [];

        (JSON.parse(req.body.tags)).forEach(function (tag) {
            tags.push(tag.tag);
            let dbtag = {};
            dbtag._id = tag.tag;
            dbtags.push(dbtag);
        });

        //save the tags. this may fire async, we don't care
        //ordered: false will also ignore any duplicate errors
        if(req.body.tags) {
            req.app.locals.db.collection(conf.db.c_tag).insertMany(dbtags, {ordered: false}, function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                }
            });
        }

        if (req.body.partner) {
            //same for partner (but there's only one)
            req.app.locals.db.collection(conf.db.c_partner).insertOne({_id: req.body.partner, name: req.body.partner}, function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                }
            });
        }
        console.log(dbtags);

        let docdata = {
            $set: {
                subject: req.body.subject,
                users: req.body.users,
                docdate: req.body.docdate,
                partner: req.body.partner,
                tags: tags
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
                } else {
                    result.founddate = false;
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
        req.app.locals.db.collection(conf.db.c_tag).find({}).toArray(function(err, taglist) {
            result.taglist = taglist;
            render.rendercallback(err, req, res, 'doc_form', result, conf, result.subject ? result.subject : result._id)
        });
    });
}

module.exports = router;
