$(document).ready(function () {
    $('.hoverover').on('mouseenter', function (evt) {
        let src = this;
        let left = $(window).width() / 3.;

        let hoverimagesel = $('#hoverimage');
        hoverimagesel
            .html('<img style="position:fixed; top:10px" height="' + ($(window).height() * 0.85) + '" src="/doc/' + src.id + '/preview/" />')
            .css({left: left, top: 100})
            .show();
        $(this).on('mouseleave', function () {
            hoverimagesel.hide();
        });
    });
});