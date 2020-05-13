$(document).ready(function () {
  //allow click only once
  $(".oneclick").one("click", function () {
    $(this).click(function () {
      return false;
    });
    $(this).css("cursor", "wait");
  });

  $("#modalsearch").modal();

  $("#button").click(function () {
    $("html, body").animate(
      {
        scrollTop: $("#navbar").offset().top,
      },
      600
    );
  });

  $("#navsearch").click(function () {
    $("#navsearch").css({ width: 400 });
  });

  $("#navsearchbutton").click(function () {
    if ($("#navsearch").val().length === 0) {
      $("#modalsearch").modal("open");
    } else {
      $("#navform").submit();
    }
  });

  $(".sidenav").sidenav({
    draggable: true,
    menuWidth: 300,
  });
  $(".collapsible").collapsible();

  //orphan menu drowpdown
  $(".dropdown-trigger").dropdown();

  //initialize general tooltips
  $(".tooltipped").tooltip();

  //Initialize Partner Autocomplete
  $.getJSON("/api/v1/partners", function (partnerlist) {
    let plist = [];
    let tooltippartnerlist = "";

    for (index = 0; index < partnerlist.length; ++index) {
      plist[partnerlist[index].name] = partnerlist[index].logo;
      tooltippartnerlist += partnerlist[index].name + ", ";
    }
    let psttsel = $("#pstt");
    psttsel.attr(
      "data-tooltip",
      '<div class="flow-text">' + tooltippartnerlist + "</div>"
    );

    $("#partnersearchinput").autocomplete({
      data: plist,
      limit: 20,
      minLength: 1,
    });
    psttsel.tooltip({ delay: 50 });
  });

  $.getJSON("/api/v1/tags", function (taglist) {
    let tooltiptaglist = "";
    for (index = 0; index < taglist.length; ++index) {
      taglist[taglist[index]._id] = null;
      tooltiptaglist += taglist[index]._id + ", ";
    }

    let tsttsel = $("#tstt");
    tsttsel.attr(
      "data-tooltip",
      '<div class="flow-text">' + tooltiptaglist + "</div>"
    );

    $("#tagsearchinput").autocomplete({
      data: taglist,
      limit: 20,
      minLength: 1,
    });
    tsttsel.tooltip({ delay: 50 });
  });

  $("#modalsearchbutton").on("click", function () {
    $("#modalsearchform").submit();
  });

  //Initialize Datepicker
  $("#docdatesearchinputfrom").datepicker({
    onStart: function () {},
    onOpen: function () {},
    format: "dd.mm.yyyy",
    selectMonths: true,
    selectYears: 15,
    today: "Heute",
    i18n: {
      clear: "L&ouml;schen",
      done: "Ok",
    },
    closeOnSelect: false,
    monthsFull: [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
    monthsShort: [
      "Jan",
      "Feb",
      "Mär",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Dez",
    ],
    weekdaysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    firstDay: 1,
    min: false,
    max: 365,
  });
  $("#docdatesearchinputto").datepicker({
    onStart: function () {},
    onOpen: function () {},
    format: "dd.mm.yyyy",
    selectMonths: true,
    selectYears: 15,
    today: "Heute",
    clear: "L&ouml;schen",
    close: "Ok",
    closeOnSelect: false,
    monthsFull: [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
    monthsShort: [
      "Jan",
      "Feb",
      "Mär",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Dez",
    ],
    weekdaysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    firstDay: 1,
    min: false,
    max: 365,
  });
});
