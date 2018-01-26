$(document).ready(function () {
    $('#modalsearch').modal();

    $("#button").click(function () {
        $('html, body').animate({
            scrollTop: $("#navbar").offset().top
        }, 600);
    });

    $('#navsearch').click(function () {
        $('#navsearch').css({width: 400});
    });

    $('#navbutton').click(function () {
        if ($('#navsearch').val().length === 0) {
            $('#modalsearch').modal('open');
        } else {
            $('#navform').submit();
        }
    });

    //Initialize Partner Autocomplete

    let lpartnerlist = window.lpartnerlist;//!{JSON.stringify(session.partnerlist).replace(/<\//g, '<\\/')}
    let plist = [];
    let tooltippartnerlist = "";

    for (index = 0; index < lpartnerlist.length; ++index) {
        plist[lpartnerlist[index].name] = lpartnerlist[index].logo;
        tooltippartnerlist += lpartnerlist[index].name + ", ";
    }
    let psttsel = $('#pstt');
    psttsel.attr('data-tooltip', '<div class="flow-text">' + tooltippartnerlist + '</div>');

    $('#partnersearchinput').autocomplete({
        data: plist,
        limit: 20,
        minLength: 1
    });

    let taglist = window.taglist; //!{JSON.stringify(session.taglist).replace(/<\//g, '<\\/')}
    let tooltiptaglist = "";
    for (index = 0; index < taglist.length; ++index) {
        taglist[taglist[index]._id] = null;
        tooltiptaglist += taglist[index]._id + ", ";
    }

    let tsttsel = $('#tstt');
    tsttsel.attr('data-tooltip', '<div class="flow-text">' + tooltiptaglist + '</div>');

    $('#tagsearchinput').autocomplete({
        data: taglist,
        limit: 20,
        minLength: 1
    });

    psttsel.tooltip({delay: 50});
    tsttsel.tooltip({delay: 50});


    $('#modalsearchbutton').on('click', function () {
        $('#modalsearchform').submit();
    });

    //Initialize Datepicker

    $('.datepicker').pickadate({
        onStart: function () {
            let docdateval = $('#docdate').val();
            year = moment(docdateval, 'DD.MM.YYYY').format("YYYY");
            month = moment(docdateval, 'DD.MM.YYYY').format("MM");
            day = moment(docdateval, 'DD.MM.YYYY').format("DD");
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
});
