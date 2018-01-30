//init a lot of stuff
$(document).ready(function () {

    function redsave() {
        $('#save').removeClass('blue').removeClass('red').addClass('red');
    }

    $('select').material_select();

    let idregex = /.*(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.pdf).*/g;
    let docid = idregex.exec(window.location.href)[1];

    $.getJSON('/api/v1/doc/' + docid, function (docdata) {

        //Initialize Datepicker
        $('.datedoc').pickadate({
            onStart: function () {
                let docdatesel = $('#docdate');
                year = moment.utc(docdatesel.val(), 'DD.MM.YYYY').format("YYYY");
                month = moment.utc(docdatesel.val(), 'DD.MM.YYYY').format("MM");
                day = moment.utc(docdatesel.val(), 'DD.MM.YYYY').format("DD");
                this.set(year, month, day);
                console.log('starting');
            },
            onOpen: function () {
                $('#docdate').removeClass('red-text');
                redsave();
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

        //Initialize Partner Autocomplete
        $.getJSON('/api/v1/partners', function (partnerlist) {
            let plist = {};
            for (index = 0; index < partnerlist.length; ++index) {
                plist[partnerlist[index].name] = partnerlist[index].logo;
            }

            let partnersel = $('#partner');
            partnersel.autocomplete({
                data: plist,
                limit: 20,
                onAutocomplete: function (val) {
                    redsave();
                },
                minLength: 1,
            });

            partnersel.on('click', function () {
                $(this).val('');
                $(this).removeClass('red-text');
                redsave();
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
        $.getJSON('/api/v1/tags', function (taglist) {

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
        });

        //init unveil
        let imgsel = $('img');
        imgsel.unveil(50, function () {
            //noop
        });

        $('#ocr1').on('click', function () {
            ocr(0, docdata);
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
        });

        if ($('.doctext').val() === '') {
            ocr(0, docdata);
        }
    });

    $('#save').on('click', function () {
        console.log('click');
        let docdata = {};

        docdata.subject = $('#subject').val();
        docdata.partner = $('#partner').val();
        docdata.docdate = $('#docdate').val();
        let tags = $('#hidden_tags').val();
        docdata.tags = [];
        $.each(JSON.parse(tags), function (key, value) {
            if (value.tag && value.tag !== '') {
                docdata.tags.push(value.tag);
            }
        });
        if (docdata.tags.length === 0) {
            delete docdata.tags;
        }
        docdata.users = [];
        $('input:checked[name="users"]').each(function () {
            if ($(this).val() && $(this).val() !== '') {
                docdata.users.push($(this).val());
            }
        });
        if (docdata.users.length === 0) {
            delete docdata.users;
        }

        console.log(docdata);

        $.post("/api/v1/doc/" + docid + "/", $.param(docdata, true), function (data, status) {
            if (status === 'success') {
                $('#save').removeClass('red').removeClass('blue').addClass('blue');
                $('#saveicon').text('done');
                Materialize.toast('Gespeichert.', 4000);
                setTimeout(function () {
                    $('#saveicon').text('save')
                }, 2000);
            } else {
                Materialize.toast('Fehler: ' + status, 4000);
            }
        }, "json");

    });

    $('#partner,#subject').on('input', function () {
        redsave();
    });

    $('.chips').on('chip.delete chip.add', function (e, chip) {
        redsave();
    });
    $('.jqusers').on('click', function () {
        redsave();
    })

});
