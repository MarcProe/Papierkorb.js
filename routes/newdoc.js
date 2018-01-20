let express = require('express');
let router = express.Router();

let glob = require('glob');
let moment = require('moment');

let config = require('config');
let conf = config.get('conf');

let render = require('../modules/render.js');
let pdfextractwrapper = require('../modules/pdfextractwrapper.js');
let ghwrapper = require('../modules/ghwrapper.js');

let fs = require('fs');
const fse = require('fs-extra');

let inspect = require('eyes').inspector({maxLength:20000});

router.get('/:filename?/:func?', function(req, res, next) {
    switch(req.params.func) {
        case "create":
            create(req, res, next)
            break;

        default:

            glob( '*.pdf', {cwd: conf.doc.newpath}, function (err, files) {

                let filearr = [];

                files.forEach(function(entry) {
                    let fileobj = {};
                    const stats = fs.statSync(conf.doc.newpath + entry);

                    fileobj.file = entry;
                    fileobj.size = Math.round(stats.size / 1024.0);
                    fileobj.mtime = stats.mtime;
                    filearr.push(fileobj);

                });

                render.rendercallback(err, req, res, 'newdoc', filearr , conf);
            });
            break;
    }
});

function create(req, res, next) {
    let targetfile = moment().toISOString().replace(/:/g,'-') + '.pdf';
    let src = conf.doc.newpath + req.params.filename;
    let target = conf.doc.basepath + targetfile;
    let imagepath = conf.doc.imagepath + targetfile;

    let numpages = 0;
    let firstPageExtract = '';

    //execute promises
    fse.rename(src, target).then(function() {                                           //move file from new to docs

        return pdfextractwrapper.go(targetfile, conf.ocr.lang, req.app.locals.db, conf);

    }).then(function(data) {                                                            //extract the first pdf file
        inspect(data, 'tesseract promise was resolved and returned');

        numpages = data.num_pages;
        firstPageExtract = [data.text];

        inspect(firstPageExtract);

        return req.app.locals.db.collection(conf.db.c_doc)
            .updateOne({_id: targetfile}, {$set: {previews: data.num_pages}}, {upsert: true});
    }).then(function (result) {                                                    //write numpages to db

        return req.app.locals.db.collection(conf.db.c_doc)
            .updateOne({_id: targetfile}, {$set: {plaintext: firstPageExtract}}, {upsert: true});

    }).then(function (result) {                                                     //write first page extract to db
        return ghwrapper.create(targetfile, imagepath, true, conf);

    }).then(function() {                                                                //create 1st preview

        redirect(res, targetfile);                                                      //redirect to the doc

        if (numpages > 1) {                                                             //only create more previews if
            return ghwrapper.create(targetfile, imagepath, false, conf);                //there is more than 1 page
        } else {
            return null;
        }

    }).then(function() {                                                                //other previews where
        console.log('Other Previews done!');                                            //created if more than 1 page
    }).catch(function(err) {
        console.error(err);
    });
}

function redirect(res, targetfile) {

    res.writeHead(302, {
        'Location': '/doc/' +targetfile + '/update/'
    });
    res.end();
}

module.exports = router;