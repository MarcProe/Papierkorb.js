let express = require('express');

let router = express.Router();

let fs = require('fs');
let padStart = require('pad-start');
let moment = require('moment');

let render = require('../modules/render.js');
let editpre = require('../modules/editpreview.js');

let conf = require('config').get('conf');

let inspect = require('eyes').inspector({maxLength: 20000});

router.get('/:docid/:func?/:genid?/', function(req, res, next) {
    switch (req.params.func) {
        case 'preview':
            preview(req, res, next);
            break;
        case 'thumb':
            preview(req, res, next, true);
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
            deletepage(req, res, req.params.docid, req.params.genid, req.query.previews);
            break;
        case 'download':
            download(req, res, req.params.docid);
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
    let filetemp = conf.doc.imagepath + docid + '.temp.png';
    let file1 = conf.doc.imagepath + docid + '.' + page + '.png';
    let file2 = '';


    if(direction === 'up') {
        file2 = conf.doc.imagepath + docid + '.' + (parseInt(page) - 1) + '.png';
    } else {
        file2 = conf.doc.imagepath + docid + '.' + (parseInt(page) + 1) + '.png';
    }

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
    //#todo pages start at 0
    for (let i = parseInt(page); i < maxpages - 1; i++) {
        let filenew = conf.doc.imagepath + docid + '.' + i + '.png';
        let fileold = conf.doc.imagepath + docid + '.' + (i + 1) + '.png';
        console.log(fileold + ' => ' + filenew);
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

function download(req, res, docid) {
    let file = fs.readFileSync(conf.doc.basepath + req.params.docid);
    res.writeHead(200, {'Content-Type': 'application/pdf'});
    res.end(file, 'binary');
}

function preview(req, res, next, thumb) {
    let thumbname = '';
    if (thumb) {
        thumbname = '.thumb';
    }
    let id = req.params.genid ? req.params.genid : 0;
    let img = fs.readFileSync(conf.doc.imagepath + req.params.docid + '.' + id + thumbname + '.png');
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');
}

function update(req, res, next) {

    if(req.params.genid === "true") {  //execute update

        let tags = [];
        (JSON.parse(req.body.tags)).forEach(function (tag) {

            tags.push(tag.tag);

            let dbtag = {};
            dbtag._id = tag.tag;

            let foundtag = req.session.taglist.some(function (el) {
                return el._id === dbtag._id;
            });

            if(!foundtag) req.session.taglist.push(dbtag);
        });

        //save the tags. this may fire async, we don't care
        //ordered: false will also ignore any duplicate errors
        if (req.body.tags && req.body.tags[0]) {
            req.app.locals.db.collection(conf.db.c_tag).insertMany(req.session.taglist, {ordered: false}, function (err, res) {
                if (err) {
                    //console.error(err);
                }
            });
        }

        if (req.body.partner) {

            let foundpartner = req.session.partnerlist.some(function (element) {
                return element._id === req.body.partner;
            });

            if(!foundpartner) {
                req.session.partnerlist.push({_id: req.body.partner, name: req.body.partner});
            }

            //same for partner (but there's only one)
            req.app.locals.db.collection(conf.db.c_partner).insertOne({_id: req.body.partner, name: req.body.partner}, function (err, res) {
                if (err) {
                    console.error(err);
                }
            });
        }

        let users;
        if (req.body.users && req.body.users.constructor === Array) {      //If only one element is given, the type is string, which is bad
            users = req.body.users
        } else {
            users = [req.body.users];
        }

        let isodate = moment.utc(req.body.docdate, 'DD.MM.YYYY').toISOString();

        let docdata = {
            $set: {
                subject: req.body.subject,
                users: users,
                docdate: isodate,
                partner: req.body.partner,
                tags: tags
            }
        };

        inspect(docdata, 'docdata');

        req.app.locals.db.collection(conf.db.c_doc).updateOne({_id: req.params.docid}, docdata, { upsert : true },  function(err, result) {
            if (err) throw err;

            res.writeHead(302, {
                'Location': '/doc/' + req.params.docid + '/update/'
            });
            res.end();
        });

    } else { //show update form

        req.app.locals.db.collection(conf.db.c_doc).findOne( {_id: req.params.docid}, function(err, result) {

            if(!result) {
                result = {};
            }
            if(!result.users) {
                result.users = [];
            }
            preparerender(req, res, next, result)
        });
    }
}

function preparerender(req, res, next, data) {
    render.rendercallback(null, req, res, 'doc', data, conf, data.subject ? data.subject : data._id)
}

module.exports = router;
