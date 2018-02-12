let express = require('express');

let router = express.Router();

let fs = require('fs');
let Jimp = require("jimp");

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

function download(req, res, docid) {
    let file = fs.readFileSync(conf.doc.basepath + req.params.docid);
    res.writeHead(200, {'Content-Type': 'application/pdf'});
    res.end(file, 'binary');
}

function preview(req, res, next, thumb) {
    let w = Number((req.query.w) ? req.query.w : Jimp.AUTO);
    let h = Number((req.query.h) ? req.query.h : Jimp.AUTO);

    let thumbname = '';
    if (thumb) {
        thumbname = '.thumb';
    }

    let img = null;
    let id = req.params.genid ? req.params.genid : 0;
    let imagepath = conf.doc.imagepath + req.params.docid + '.' + id + thumbname + '.png';

    if (w && w > 0 || h && h > 0) {
        console.log(w + ' ' + h);
        Jimp.read(imagepath, function (err, image) {
            img = image.scaleToFit(w, h).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                res.writeHead(200, {'Content-Type': Jimp.MIME_PNG});

                res.end(buffer, 'binary');
            });
        });
    } else {
        img = fs.readFileSync(imagepath);
        res.writeHead(200, {'Content-Type': Jimp.MIME_PNG});
        res.end(img, 'binary');
    }
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
    render.rendercallback(null, req, res, 'doc', data, conf, data.subject ? data.subject : data._id)
}

module.exports = router;
