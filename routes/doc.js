let express = require('express');

let router = express.Router();

let render = require('../modules/render.js');
let editpre = require('../modules/editpreview.js');

let fs = require('fs');
let conf = require('config').get('conf');
let inspect = require('eyes').inspector({maxLength: 20000});

router.get('/:docid/:func?/:genid?/', function(req, res, next) {
    switch (req.params.func) {
        case 'edit':
            editpre.edit(res, req.params.genid, req.params.docid, req.query.preview, req.query.degrees);
            break;
        case 'move':
            movepage(res, req.params.docid, req.params.genid, req.query.page);
            break;
        case 'delete':
            deletepage(req, res, req.params.docid, req.params.genid, req.query.previews);
            break;
        default:
            show(req, res, next);
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
    fs.unlinkSync(conf.doc.imagepath + docid + '.' + page + '.thumb.png');

    //move all lower pages
    for (let i = parseInt(page); i < maxpages - 1; i++) {
        let filenew = conf.doc.imagepath + docid + '.' + i + '.png';
        let fileold = conf.doc.imagepath + docid + '.' + (i + 1) + '.png';

        fs.renameSync(fileold, filenew);

        let thumbnew = conf.doc.imagepath + docid + '.' + i + '.thumb.png';
        let thumbold = conf.doc.imagepath + docid + '.' + (i + 1) + '.thumb.png';

        fs.renameSync(thumbold, thumbnew);
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

function show(req, res, next) {

    req.app.locals.db.collection(conf.db.c_doc).findOne({_id: req.params.docid}, function (err, result) {

        if (!result) {
            result = {};
        }
        if (!result.users) {
            result.users = [];
        }
        preparerender(req, res, next, result)
    });

}

function preparerender(req, res, next, data) {
    render.rendercallback(null, req, res, 'doc', data, conf, data.subject ? data.subject.substring(0, 20) + '&hellip;' : data._id)
}

module.exports = router;
