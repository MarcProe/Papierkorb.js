let express = require('express');
let router = express.Router();

let render = require('../modules/render.js');

let config = require('config');
let conf = config.get('conf');

router.get('/', function(req, res, next) {
    let title = 'Willkommen im Papierkorb';
    render.rendercallback(null, req, res, 'index', {}, conf, title);
});

module.exports = router;
