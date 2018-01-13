let Jimp = require("jimp");
let config = require('config');
let conf = config.get('conf');

let editpreview = {
    edit: function(res, func, docid, page, param) {
        switch(func) {
            case 'rotate':
                this.rotate(res, docid, page, param);
                break;
        }
    },
    rotate: function(res, docid, page, degrees) {
        let filename = conf.doc.imagepath + docid + '.' + page + '.png';
        console.log(filename);
        Jimp.read(filename, function (err, pic) {
            if (err) throw err;
            pic.rotate(parseInt(degrees))
                .write(filename, function(err) {
                    res.writeHead(302, {
                        'Location': '/doc/' +docid + '/update/'
                    });
                    res.end();
                });
        });
    }
};

module.exports = editpreview;