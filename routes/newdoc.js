let express = require('express');
let router = express.Router();

let glob = require('glob');
let moment = require('moment');

let config = require('config');
let conf = config.get('conf');

let render = require('../modules/render.js');

let fs = require('fs');

let inspect = require('eyes').inspector({maxLength:20000});
let pdf_extract = require('pdf-extract');

let exec = require('child_process').exec;

/* GET home page. */
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
    console.log(src + ' -> ' + target);
    fs.rename(src, target, function movepdf(err) {
        if(err) {
            res.send(err);
            res.end();
        } else {
            let options = {
                type: 'ocr', // perform ocr to get the text within the scanned image
                ocr_flags: [
                    '-l deu+nld+eng',       // use a custom language file
                ]
            };

            let processor = pdf_extract(target, options, function(err) {
                extracttext(err, res);
            });
            processor.on('complete', function(data) {
                extractok(data, req, res, targetfile)
            });
            processor.on('error', function(err) {
                extracterr(err, res);
            });
        }
    });
}

function extracttext(err, res) {
    if (err) {
        res.send(err);
        res.end();
    }
}

function extractok(data, req, res, targetfile) {
    inspect(data.text_pages, 'extracted text pages');

    console.log(data.text_pages);

    let docdata = {
        $set: {
            plaintext: data.text_pages
        }
    };

    req.app.locals.db.collection(conf.db.c_doc).updateOne({_id: targetfile}, docdata, { upsert : true },  function updatedatabase(err, result) {
        if (err) throw err;
        console.log("document updated");

        let imagepath = conf.doc.imagepath + targetfile;
        let docpath = conf.doc.basepath + targetfile;
        let cmd = 'gs -dBATCH -dNOPAUSE -sDEVICE=pngalpha -sOutputFile=' + imagepath + '.%d.png -r300 ' + docpath;

        console.log(cmd);

        let procoptions = { maxBuffer: 4096 * 4096 };
        let child = exec(cmd, procoptions, function createpreview(err, stdout, stderr) {

            if (err) {
                res.send(err);
                res.end();
            }

            let numpreviews = stdout.match(/Processing pages 1 through (\d)\./)[1];

            let docdata = { $set: { previews: numpreviews } };

            //save numpreviews to database
            req.app.locals.db.collection(conf.db.c_doc).updateOne({_id: targetfile}, docdata, { upsert : true },  redirect(err, res, targetfile));

        });

    });
}

function redirect(err, res, targetfile) {
    if (err) throw err;

        res.writeHead(302, {
            'Location': '/doc/' +targetfile + '/update/'
        });
        res.end();
}

function extracterr(err, res) {
    inspect(err, 'error while extracting pages');
    res.send(err);
    res.end();
}

module.exports = router;