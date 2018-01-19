let exec = require('child_process').exec;
let inspect = require('eyes').inspector({maxLength:20000});

let ghwrapper = {
    create: function (pdffile, targetpath, onlyfirst, conf) {

        let count;
        let firstpage;
        if (onlyfirst) {
            count = '0';
            firstpage = 1;
        } else {
            count = '%d';
            firstpage = 2;
        }
        let pdffilepath = conf.doc.basepath + pdffile;
        let cmd = 'gs -dBATCH -dNOPAUSE -sDEVICE=pngalpha -dFirstPage=' + firstpage +
            ' -sOutputFile=' + targetpath + '.' + count + '.png -r300 ' + pdffilepath;

        let procoptions = {maxBuffer: 4096 * 4096};


        return new Promise(function (resolve, reject) {
            let child = exec(cmd, procoptions, function createpreview(err, stdout, stderr) {

                if (err) {
                    reject(err);
                }

                inspect(stdout, 'gh output');

                let numpreviews = stdout.match(/Processing pages (\d+) through (\d+)\./)[2];

                resolve(numpreviews)

            });
        });
    }
};


module.exports = ghwrapper;