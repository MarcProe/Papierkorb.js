let inspect = require('eyes').inspector({maxLength:20000});
let pdf_extract = require('pdf-extract');

let pdfextractwrapper = {
    go: function(file, lang, db, conf) {

        let fullfile = conf.doc.basepath + file;

        let options = {
            type: 'ocr', // perform ocr to get the text within the scanned image
            ocr_flags: [
                '-l ' + lang, // use a custom language file
            ]
        };

        return new Promise(function(resolve, reject) {

            let processor = pdf_extract(fullfile, options, function (err) {
                if (err) {
                    reject(err);
                }
            });
            processor.on('complete', function (data) {
                //save to database and exit
                let docdata = {
                    $set: {
                        plaintext: data.text_pages 
                    }
                };

                db.collection(conf.db.c_doc).updateOne({_id: file}, docdata, { upsert : true },  function updatedatabase(err, result) {
                    if (err) {
                        reject(err);
                    }
                    inspect(data, 'oncomplete data');
                    console.log('document ' + file + ' was fully extracted and saved in the database');
                    inspect(result.result, "dbop");
                });
            });

            processor.on('error', function (err) {
                reject(err);
            });

            processor.on('page', function (data) {
                if (data.index === 0) {
                    //first page done, so resolve
                    //the extraction will continue in the background
                    //pass the data to do partner and date extraction
                    resolve(data);
                }
            });
        });
    }
};

module.exports = pdfextractwrapper;
