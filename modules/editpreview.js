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
    rotate: function (res, docid, page, degrees, thumb) {
        let sthumb = (thumb) ? '.thumb' : '';
        let filename = conf.doc.imagepath + docid + '.' + page + sthumb + '.png';
        Jimp.read(filename, function (err, pic) {
            if (err) throw err;
            pic.rotate(parseInt(degrees))
                .write(filename, function(err) {
                    if (!thumb) {
                        res.writeHead(302, {
                            'Location': '/doc/' + docid + '/update/'
                        });
                        res.end();
                    }
                });
        });
        if (!thumb) {
            this.rotate(res, docid, page, degrees, true);
        }
    }
};

module.exports = editpreview;
