const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

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

    let retval = {};
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
        let retval = {}
        retval.plaintext = [];
        retval.plaintext.push(ocrtext);

        $.post("/api/v1/ocr/" + window.docdata._id + "/", $.param(retval, true), function (data, status) {
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

//init a lot of stuff
$(document).ready(function () {

    docdata = window.docdata;//!{JSON.stringify(data).replace(/<\//g, '<\\/')}

    //Initialize Datepicker
    $('.datepicker').pickadate({
        onStart: function () {
            let docdatesel = $('#docdate');
            year = moment.utc(docdatesel.val(), 'DD.MM.YYYY').format("YYYY");
            month = moment.utc(docdatesel.val(), 'DD.MM.YYYY').format("MM");
            day = moment.utc(docdatesel.val(), 'DD.MM.YYYY').format("DD");
            this.set(year, month, day);
        },
        onOpen: function () {
            $('#docdate').removeClass('red-text')
        },
        format: 'dd.mm.yyyy',
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Heute',
        clear: 'L&ouml;schen',
        close: 'Ok',
        closeOnSelect: false, // Close upon selecting a date,
        monthsFull: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        firstDay: 1,
        min: false,
        max: 365
    });

    //Initialize Select
    $('select').material_select();

    //Initialize Partner Autocomplete
    $.getJSON('/api/v1/partners', function (partnerlist) {
        //let partnerlist = window.partnerlist;// !{JSON.stringify(session.partnerlist).replace(/<\//g, '<\\/')}
        let plist = {};
        for (index = 0; index < partnerlist.length; ++index) {
            plist[partnerlist[index].name] = partnerlist[index].logo;
        }

        let partnersel = $('#partner');
        partnersel.autocomplete({
            data: plist,
            limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
            onAutocomplete: function (val) {
                // Callback function when value is autcompleted.
            },
            minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
        });

        partnersel.on('click', function () {
            $(this).val('')
            $(this).removeClass('red-text');
        });
    });
    //Initialize modal delete dialogue
    let modaldeletesel = $('#modaldelete');
    modaldeletesel.modal();
    $('#canceldelete').on('click', function () {
        modaldeletesel.modal('close');
    });

    //Fix page header column height

    $('#editcol').css({
        height: +$('#pageheadercol').height()
    });

    //delete preview "are you sure"
    $('.deletepreview').on('click', function () {
        let page = this.id.split("_").pop();
        Materialize.Toast.removeAll();
        let $toastContent = $('<i class="material-icons medium white-text">delete_forever</i>')
            .add($('<a href="/doc/' + docdata._id + '/delete/' + page + '?previews=' + docdata.previews + '" class="btn-flat toast-action">Sicher?</button>'));
        Materialize.toast($toastContent, 10000, 'rounded');
    });

    //tag chips
    let taglist = window.taglist;//!{JSON.stringify(session.taglist).replace(/<\//g, '<\\/')}

    taglist = taglist.sort(function (a, b) {
        return a._id > b._id ? 1 : b._id > a._id ? -1 : 0
    });

    let seltags = [];
    if (docdata.tags) {
        docdata.tags.forEach(function (tag) {
            seltags.push({tag: tag});
        })
    }
    let tags = {};
    let tagtooltip = "";
    if (taglist) {
        taglist.forEach(function (tag) {
            tags[tag._id] = null;
            tagtooltip += tag._id + ', ';
        })
    }

    let tagstooltipsel = $('#tagstooltip');
    tagstooltipsel.attr('data-tooltip', '<div class="flow-text">' + tagtooltip + '</div>');
    tagstooltipsel.tooltip({delay: 50});

    let chipssel = $('.chips');
    let chipsautocompletesel = $('.chips-autocomplete');
    chipssel.material_chip();

    chipsautocompletesel.material_chip({
        placeholder: 'Tags eingeben',
        secondaryPlaceholder: 'Mehr Tags',
        autocompleteOptions: {
            data: tags,
            limit: Infinity,
            minLength: 1
        },
        data: seltags
    });

    let hiddentagssel = $('#hidden_tags');
    hiddentagssel.val(JSON.stringify(seltags)); //store array
    chipssel.on('chip.add', function (e, chip) {
        hiddentagssel.val(JSON.stringify(chipsautocompletesel.material_chip('data')));
    });

    chipssel.on('chip.delete', function (e, chip) {
        hiddentagssel.val(JSON.stringify(chipsautocompletesel.material_chip('data')));
    });

    //init unveil
    let imgsel = $('img');
    imgsel.unveil(50, function () {
        let doctextsel = $('.doctext');
        if ($(this).attr('id') === 'image_0' && doctextsel.val() === '') {
            ocr(0);
        }
    });

    $('#ocr1').on('click', function () {
        ocr(0);
    });

    setTimeout(function () {
        $('.previewcontainer').css('min-height', '0px');
    }, 600);

    //load a placeholder if preview image is not (yet) created
    imgsel.on('error', function () {
        $(this).unbind("error");
        $(this).attr("src", "/images/papierkorb-logo.png");
    });

    //reloadpreview button
    $('.reloadpreview').on('click', function () {
        let image = $(this).attr('data-id');
        let numimagesel = $('#' + image);
        let src = numimagesel.attr("data-src");
        numimagesel.attr("src", src + '?timestamp=' + new Date().getTime());
    })

});
