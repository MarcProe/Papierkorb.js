function subjectautocomplete(singletext) {
    //Initialize Partner Autocomplete

    let arr = singletext.split("\n").filter(line => line.length > 6);
    let subjlist = {};

    arr.forEach(function (element) {
        subjlist[element] = null;
    });

    let subjectsel = $('#subject');
    subjectsel.autocomplete({
        data: subjlist,
        limit: 20,
        minLength: 1,
    });
}

function finddate(singletext) {
    if (singletext) {
        //versuche das Datum zu finden
        let regex = /([\d]{1,2})\.\s?([\d]{1,2}|[\w]{3,9})\.?\s?(\d{4}|\d{2})/;
        let dateregex = singletext.match(regex);
        if (dateregex) {
            let day = dateregex[1];
            let month = dateregex[2];
            let year = dateregex[3];

            if (isNaN(month)) {
                month = months.indexOf(month) + 1;
            }
            let tempdate = ('0' + day).slice(-2) + '-' + ('0' + month).slice(-2) + '-' + ('200' + year).slice(-4);

            return moment.utc(tempdate, 'DD.MM.YYYY').toISOString();
        } else {
            return null;
        }
    }
}

function findpartner(singletext) {
    let bestpartner = {"name": "", "score": "0"};

    if (singletext) {
        return new Promise(function (resolve, reject) {
            $.getJSON('/api/v1/partners', function (partnerlist) {
                partnerlist.forEach(function (partner) {
                    let score = 0;

                    if (!partner.search) {
                        partner.search = [];
                    }
                    partner.search.push(partner.name);

                    partner.search.forEach(function (search) {
                        let partnerfind = singletext.match(new RegExp(search));

                        if (partnerfind) {
                            score++;
                        }
                    });
                    if (score > bestpartner.score) {
                        bestpartner.name = partner.name;
                        bestpartner.score = score;
                    }
                });
                resolve(bestpartner);
            });
        });
    } else {
        return new Promise(function (resolve, reject) {
            resolve(null);
        });
    }
}

function finduser(singletext) {
    let userarr = [];
    let maxscore = 1;   //filters all scores lower than this

    if (singletext) {
        return new Promise(function (resolve, reject) {
            $.getJSON('/api/v1/user', function (userlist) {
                userlist.forEach(function (user) {
                    let score = 0;

                    if (!user.search) {
                        user.search = [];
                    }
                    user.search.push(user.name);

                    user.search.forEach(function (search) {
                        let userfind = singletext.match(new RegExp(search));

                        if (userfind) {
                            score++;
                        }
                        if (score > maxscore) {
                            maxscore = score;
                        }
                    });

                    let match = {};
                    match.name = user.name;
                    match.score = score;

                    userarr.push(match);

                });
                resolve(userarr.filter(usr => usr.score === maxscore));
            });
        });
    } else {
        return new Promise(function (resolve, reject) {
            resolve([]);
        });
    }
}

function ocr(img) {

    let qhost = window.qhost; //!{JSON.stringify(qhost).replace(/<\//g, '<\\/')}

    window.Tesseract = Tesseract.create({
        workerPath: qhost + '/javascripts/worker.js',
        langPath: qhost + '/tessdata/',
        corePath: qhost + '/javascripts/index.js',
    });

    let docdata = window.docdata;//!{JSON.stringify(data).replace(/<\//g, '<\\/')};
    let doctextsel = $('.doctext');
    let ocrtext = '';
    Tesseract.recognize('/doc/' + docdata._id + '/preview/' + img, {
        lang: 'deu',
    }).progress(function (message) {

        let ocrsel = $('#ocr');
        if (message.status === "recognizing text") {

            ocrsel.attr('class', 'determinate');
            ocrsel.css('width', (message.progress * 100) + '%')
        } else {
            ocrsel.attr('class', 'indeterminate');
        }
    }).then(function (result) {

        ocrtext = result.text;
        doctextsel.val(ocrtext);
        let retval = {};
        retval.plaintext = [];
        retval.plaintext.push(ocrtext);

        $.post("/api/v1/ocr/" + window.docdata._id + "/", $.param(retval, true), function (data, status) {
            //noop
        }, "json");

        let founddate = finddate(ocrtext);
        let docdatesel = $('#docdate');

        if (founddate && (!docdatesel.val() || docdatesel.val() === '')) {
            docdatesel.val(moment.utc(founddate).format('DD.MM.YYYY').toString());
        }

        findpartner(ocrtext).then(function (foundpartner) {
            let partnersel = $('#partner');

            if (foundpartner && (!partnersel.val() || partnersel.val() === '')) {
                partnersel.val(foundpartner.name);
            }
        });

        finduser(ocrtext).then(function (fu) {
            let founduser = fu;
            $('.jqusers').each(function () {
                let jqusers = $(this);
                let username = $(this).attr('id').split('_')[1];
                founduser.forEach(function (element) {
                    if (username === element.name) {
                        jqusers.attr('checked', true);
                    }
                });
            });
        });

        subjectautocomplete(ocrtext);
    });
}
