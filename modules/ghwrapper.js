let exec = require('child_process').exec;
let inspect = require('eyes').inspector({maxLength:20000});

let ghwrapper = {
    create: function (pdffile, targetpath, onlyfirst, conf, thumb) {

        let device = '';
        let thumbfile = '';
        if (thumb) {
            device = 'pngmono';
            thumbfile = '.thumb';
        } else {
            device = 'png16m';
        }
        let count;
        let firstpage;
        let lastpage;
        if (onlyfirst) {
            count = '0';
            firstpage = 1;
            lastpage = 1;
        } else {
            count = '%d';
            firstpage = 2;
            lastpage = 999;
        }
        let pdffilepath = conf.doc.basepath + pdffile;

        let cmd = 'gs -dBATCH -dNOPAUSE -sDEVICE=' + device + ' -dFirstPage=' + firstpage +
            ' -dLastPage=' + lastpage + ' -sOutputFile=' + targetpath + '.' + count + thumbfile + '.png -r150 ' + pdffilepath;

        let procoptions = {maxBuffer: 4096 * 4096};


        return new Promise(function (resolve, reject) {
            let child = exec(cmd, procoptions, function createpreview(err, stdout, stderr) {

                if (err) {
                    reject(err);
                }

                inspect(stdout, 'gh output');
                let regexresult = stdout.match(/Processing pages (\d+) through (\d+)\./);
                let numpreviews;
                if (regexresult) {
                    numpreviews = regexresult[2];
                } else {
                    numpreviews = 0;
                }

                resolve(numpreviews)

            });
        });
    },
    pagecount: function (path) {

        let cmd = 'gs -q -dNODISPLAY -c "(' + path + ') (r) file runpdfbegin pdfpagecount = quit"';
        let procoptions = {maxBuffer: 4096 * 4096};

        return new Promise(function (resolve, reject) {
            let child = exec(cmd, procoptions, function pdfpagecount(err, stdout, stderr) {

                if (err) {
                    reject(err);
                }

                inspect(stdout, 'gh output');
                let retval = stdout.replace(/(\r\n|\n|\r)/gm, "");
                resolve(retval)
            });
        });
    }
};


module.exports = ghwrapper;