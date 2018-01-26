let express = require('express');
let router = express.Router();


let conf = require('config').get('conf');

let inspect = require('eyes').inspector({maxLength: 20000});

router.get('/', function (req, res, next) {

});

router.post('/:version/:func/:docid/', function (req, res, next) {
    console.log(req.params.version);
    console.log(req.params.func);
    console.log(req.params.docid);
    console.log(req.body);

    switch (req.params.func) {
        case 'ocr':
            try {

                req.app.locals.db.collection(conf.db.c_doc).updateOne({_id: req.params.docid}, {$set: req.body}, {upsert: false}, function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        res.send({message: result});
                        res.end();
                    }
                });
            } catch (err) {
                res.writeHead(500, {
                    'message': err
                });
                res.end();
            }
            break;
    }
});

module.exports = router;