let express = require('express');
let router = express.Router();

let render = require('../modules/render.js');

let config = require('config');
let conf = config.get('conf');

router.get('/', function(req, res, next) {
    render.rendercallback(null, req, res, 'index', null, conf);
});

module.exports = router;
